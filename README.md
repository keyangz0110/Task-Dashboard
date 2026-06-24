# Task Dashboard

A bilingual task kanban dashboard built with SvelteKit 5, Bits UI v2, Supabase, and a Python serverless API for AI weekly reports.

## Stack

- **Frontend**: SvelteKit 5, Tailwind CSS v4, Bits UI v2, svelte-dnd-action
- **Backend**: Python FastAPI on Vercel (`/api/generate-weekly-report`)
- **Database & Auth**: Supabase PostgreSQL with RLS
- **Deploy**: Vercel

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order in the Supabase SQL Editor:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) — initial schema
   - [`supabase/migrations/002_task_categories.sql`](supabase/migrations/002_task_categories.sql) — user-defined categories (run this if you already applied 001)
3. Enable Email auth under Authentication → Providers
4. Copy your project URL, anon key, service role key, and JWT secret

### 2. Local development

```bash
cp .env.example .env
# Fill in PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY

npm install
npm run dev
```

### 3. Vercel deployment

Set these environment variables in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (Project Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Python API only) |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification |
| `LLM_API_KEY` | OpenAI / DeepSeek / Gemini API key |
| `LLM_PROVIDER` | `openai`, `deepseek`, or `gemini` |
| `LLM_MODEL` | Model name (e.g. `gpt-4o-mini`) |

Add your Vercel URL to Supabase Auth redirect URLs: `https://<your-domain>/auth/callback`

## Features

- Kanban board with drag-and-drop (temporary + routine sections)
- Multi-user assignment (my work / delegated / all)
- Priority scoring: urgent, important, duration, routine
- Weekly / monthly / custom history views
- AI-generated weekly reports (bilingual)
- Dark/light theme + EN/中文 UI toggle
