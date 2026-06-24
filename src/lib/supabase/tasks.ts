import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Profile, RoutineFrequency, SortDirection, SortField, Task, TaskCategory, TaskFormData, TaskKind, UserRole, WorkView } from './types';

function routineFieldsFromForm(form: Pick<TaskFormData, 'task_kind' | 'routine_frequency'>) {
	return {
		is_routine: form.task_kind === 'routine',
		routine_frequency: form.task_kind === 'routine' ? form.routine_frequency : null
	};
}

export type TaskSupabase = SupabaseClient<Database>;

const TASK_SELECT = `
  *,
  assigned_by_profile:profiles!tasks_assigned_by_fkey(id, display_name, avatar_url, preferred_locale, created_at, updated_at),
  assigned_to_profile:profiles!tasks_assigned_to_fkey(id, display_name, avatar_url, preferred_locale, created_at, updated_at),
  task_category:task_categories(id, name, user_id, created_at)
`;

export async function fetchCategoriesFor(
	supabase: TaskSupabase,
	userId: string
): Promise<TaskCategory[]> {
	const { data, error } = await supabase
		.from('task_categories')
		.select('*')
		.eq('user_id', userId)
		.order('name');
	if (error) throw error;
	return (data ?? []) as TaskCategory[];
}

export async function fetchCategories(userId: string): Promise<TaskCategory[]> {
	return fetchCategoriesFor(createClient(), userId);
}

export async function createCategory(userId: string, name: string): Promise<TaskCategory> {
	const supabase = createClient();
	const trimmed = name.trim();
	if (!trimmed) throw new Error('Category Name is Required');
	const { data, error } = await supabase
		.from('task_categories')
		.insert({ user_id: userId, name: trimmed })
		.select('*')
		.single();
	if (error) throw error;
	return data as TaskCategory;
}

export async function fetchProfilesFor(supabase: TaskSupabase): Promise<Profile[]> {
	const { data, error } = await supabase.from('profiles').select('*').order('display_name');
	if (error) throw error;
	return (data ?? []) as Profile[];
}

export async function fetchProfiles(): Promise<Profile[]> {
	return fetchProfilesFor(createClient());
}

export async function fetchTasksFor(
	supabase: TaskSupabase,
	userId: string,
	role: UserRole = 'contributor'
): Promise<Task[]> {
	let query = supabase.from('tasks').select(TASK_SELECT).order('priority_score', { ascending: false });

	if (role === 'supervisor') {
		query = query.or(`assigned_by.eq.${userId},assigned_to.eq.${userId}`);
	} else {
		query = query.eq('assigned_to', userId);
	}

	const { data, error } = await query;
	if (error) throw error;
	return (data ?? []) as Task[];
}

export async function fetchTasks(userId: string): Promise<Task[]> {
	return fetchTasksFor(createClient(), userId);
}

export async function createTask(userId: string, form: TaskFormData) {
	const supabase = createClient();
	const assignedTo = form.assignment_type === 'myself' ? userId : form.assigned_to;
	const { data, error } = await supabase
		.from('tasks')
		.insert({
			title: form.title,
			status: form.status,
			due_date: form.due_date || null,
			is_urgent: form.is_urgent,
			is_important: form.is_important,
			duration_type: form.duration_type,
			...routineFieldsFromForm(form),
			category_id: form.category_id || null,
			assigned_by: userId,
			assigned_to: assignedTo,
			notes: form.notes
		})
		.select(TASK_SELECT)
		.single();
	if (error) throw error;
	return data as Task;
}

export async function updateTask(taskId: string, form: Partial<TaskFormData> & { status?: Task['status'] }, userId?: string) {
	const supabase = createClient();
	const { assignment_type, assigned_to, task_kind, routine_frequency, ...rest } = form;
	const payload = {
		...rest,
		...(task_kind !== undefined
			? routineFieldsFromForm({
					task_kind,
					routine_frequency: routine_frequency ?? null
				})
			: {}),
		...(form.category_id !== undefined ? { category_id: form.category_id || null } : {}),
		...(form.due_date !== undefined ? { due_date: form.due_date === '' ? null : form.due_date } : {}),
		...(assignment_type !== undefined && userId
			? { assigned_to: assignment_type === 'myself' ? userId : assigned_to }
			: assigned_to !== undefined
				? { assigned_to }
				: {})
	};
	const { data, error } = await supabase
		.from('tasks')
		.update(payload as Database['public']['Tables']['tasks']['Update'])
		.eq('id', taskId)
		.select(TASK_SELECT)
		.single();
	if (error) throw error;
	return data as Task;
}

export async function deleteTask(taskId: string) {
	const supabase = createClient();
	const { error } = await supabase.from('tasks').delete().eq('id', taskId);
	if (error) throw error;
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
	return updateTask(taskId, { status });
}

export function filterByWorkView(tasks: Task[], userId: string, view: WorkView, role: UserRole = 'contributor'): Task[] {
	if (role === 'contributor') {
		return tasks.filter((task) => task.assigned_to === userId);
	}
	if (view === 'mine') return tasks.filter((task) => task.assigned_to === userId);
	if (view === 'delegated')
		return tasks.filter((task) => task.assigned_by === userId && task.assigned_to !== userId);
	return tasks;
}

export interface TaskFilters {
	urgent?: boolean;
	important?: boolean;
	duration?: Task['duration_type'] | null;
	task_kind?: TaskKind | null;
	routine_frequency?: RoutineFrequency | null;
	category_id?: string | null;
}

export function applyTaskFilters(tasks: Task[], filters: TaskFilters): Task[] {
	return tasks.filter((task) => {
		if (filters.urgent && !task.is_urgent) return false;
		if (filters.important && !task.is_important) return false;
		if (filters.duration && task.duration_type !== filters.duration) return false;
		if (filters.task_kind === 'one_time' && task.is_routine) return false;
		if (filters.task_kind === 'routine' && !task.is_routine) return false;
		if (
			filters.routine_frequency &&
			task.routine_frequency !== filters.routine_frequency
		) {
			return false;
		}
		if (filters.category_id === 'none' && task.category_id) return false;
		if (
			filters.category_id &&
			filters.category_id !== 'none' &&
			task.category_id !== filters.category_id
		) {
			return false;
		}
		return true;
	});
}

export function sortTasks(
	tasks: Task[],
	field: SortField,
	direction: SortDirection
): Task[] {
	const sorted = [...tasks].sort((a, b) => {
		if (field === 'priority_score') return b.priority_score - a.priority_score;
		if (field === 'due_date') {
			const aDate = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
			const bDate = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
			return aDate - bDate;
		}
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});
	return direction === 'asc' ? sorted.reverse() : sorted;
}

export function groupTasksForDashboard(tasks: Task[]) {
	const today = new Date().toISOString().slice(0, 10);
	const open = tasks.filter((task) => task.status !== 'done');
	const todayTasks = tasks.filter((task) => task.due_date === today);
	return { open, todayTasks };
}

export async function updateProfile(userId: string, displayName: string, preferredLocale: 'en' | 'zh') {
	const supabase = createClient();
	const { error } = await supabase
		.from('profiles')
		.update({ display_name: displayName, preferred_locale: preferredLocale })
		.eq('id', userId);
	if (error) throw error;
}

export async function generateWeeklyReport(
	weekStart: string,
	locale: string,
	accessToken: string
): Promise<{ report: string; task_count: number }> {
	const response = await fetch('/api/generate-weekly-report', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({ week_start: weekStart, locale })
	});
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(body.detail ?? 'Failed to Generate Report');
	}
	return response.json();
}
