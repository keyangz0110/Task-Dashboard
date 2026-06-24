import json
import os
from datetime import datetime, timedelta
from typing import Any

import httpx
import jwt
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReportRequest(BaseModel):
    week_start: str
    locale: str = "en"


def get_supabase():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase Not Configured")
    return create_client(url, key)


def verify_jwt(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization")
    token = authorization.split(" ", 1)[1]
    secret = os.environ.get("SUPABASE_JWT_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="JWT Secret Not Configured")
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        return payload["sub"]
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid Token") from exc


def duration_label(duration_type: str, locale: str) -> str:
    labels = {
        "en": {"short": "Short", "medium": "Medium", "long": "Long"},
        "zh": {"short": "短", "medium": "中", "long": "长"},
    }
    return labels.get(locale, labels["en"]).get(duration_type, duration_type)


def build_prompt(tasks: list[dict[str, Any]], locale: str, week_start: str) -> str:
    week_end = (datetime.fromisoformat(week_start) + timedelta(days=6)).date().isoformat()
    lines = []
    for task in tasks:
        lines.append(
            f"- {task['title']} | notes: {task.get('notes') or 'none'} | "
            f"duration: {duration_label(task.get('duration_type', 'medium'), locale)} | "
            f"completed: {task.get('completed_at', '')}"
        )
    task_block = "\n".join(lines) if lines else "(no completed tasks)"

    if locale == "zh":
        return (
            f"请根据以下在 {week_start} 至 {week_end} 期间完成的任务，"
            f"撰写一份专业的中文周报。包含：本周完成事项、关键产出、遇到的阻碍、下周建议。\n\n"
            f"任务列表：\n{task_block}"
        )
    return (
        f"Generate a professional weekly workplace report for completed work "
        f"from {week_start} to {week_end}. Include: accomplishments, key deliverables, "
        f"blockers, and suggestions for next week.\n\nTasks:\n{task_block}"
    )


async def call_llm(prompt: str) -> str:
    provider = os.environ.get("LLM_PROVIDER", "openai")
    api_key = os.environ.get("LLM_API_KEY")
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")

    if not api_key:
        return (
            "AI report generation is not configured. Set LLM_API_KEY in Vercel environment variables."
        )

    if provider == "deepseek":
        url = "https://api.deepseek.com/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {
            "model": model or "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4,
        }
    elif provider == "gemini":
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model or 'gemini-2.0-flash'}:generateContent?key={api_key}"
        )
        headers = {"Content-Type": "application/json"}
        body = {"contents": [{"parts": [{"text": prompt}]}]}
    else:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4,
        }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()

    if provider == "gemini":
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return data["choices"][0]["message"]["content"]


@app.post("/api/generate-weekly-report")
async def generate_weekly_report(
    data: ReportRequest,
    authorization: str | None = Header(default=None),
):
    user_id = verify_jwt(authorization)
    week_start = datetime.fromisoformat(data.week_start).date()
    week_end = week_start + timedelta(days=7)

    supabase = get_supabase()
    result = (
        supabase.table("tasks")
        .select("*")
        .eq("assigned_to", user_id)
        .eq("status", "done")
        .gte("completed_at", week_start.isoformat())
        .lt("completed_at", week_end.isoformat())
        .order("completed_at")
        .execute()
    )
    tasks = result.data or []
    prompt = build_prompt(tasks, data.locale, data.week_start)
    report = await call_llm(prompt)

    supabase.table("weekly_reports").upsert(
        {
            "user_id": user_id,
            "week_start": data.week_start,
            "content": report,
        },
        on_conflict="user_id,week_start",
    ).execute()

    return {"report": report, "task_count": len(tasks)}


handler = app
