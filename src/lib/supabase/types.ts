export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type DurationType = 'short' | 'medium' | 'long';
export type TaskKind = 'one_time' | 'routine';
export type RoutineFrequency = 'daily' | 'weekly' | 'quarterly' | 'yearly';
export type UserRole = 'supervisor' | 'contributor';
export type WorkView = 'mine' | 'delegated' | 'all';
export type SortField = 'priority_score' | 'due_date' | 'created_at';
export type SortDirection = 'asc' | 'desc';
export type AssignmentType = 'myself' | 'delegate';

export interface Profile {
	id: string;
	display_name: string;
	avatar_url: string | null;
	preferred_locale: 'en' | 'zh';
	role: UserRole;
	created_at: string;
	updated_at: string;
}

export interface TaskCategory {
	id: string;
	user_id: string;
	name: string;
	created_at: string;
}

export interface Task {
	id: string;
	title: string;
	status: TaskStatus;
	due_date: string | null;
	is_urgent: boolean;
	is_important: boolean;
	duration_type: DurationType;
	is_routine: boolean;
	routine_frequency: RoutineFrequency | null;
	category_id: string | null;
	assigned_by: string;
	assigned_to: string;
	notes: string;
	priority_score: number;
	created_at: string;
	updated_at: string;
	completed_at: string | null;
	assigned_by_profile?: Profile;
	assigned_to_profile?: Profile;
	task_category?: TaskCategory | null;
}

export interface WeeklyReport {
	id: string;
	user_id: string;
	week_start: string;
	content: string;
	created_at: string;
}

export interface TaskFormData {
	title: string;
	status: TaskStatus;
	due_date: string;
	is_urgent: boolean;
	is_important: boolean;
	duration_type: DurationType;
	task_kind: TaskKind;
	routine_frequency: RoutineFrequency | null;
	category_id: string | null;
	assignment_type: AssignmentType;
	assigned_to: string;
	notes: string;
}

export const STATUS_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done'];

export function emptyTaskForm(currentUserId: string): TaskFormData {
	return {
		title: '',
		status: 'todo',
		due_date: '',
		is_urgent: false,
		is_important: false,
		duration_type: 'medium',
		task_kind: 'one_time',
		routine_frequency: null,
		category_id: null,
		assignment_type: 'myself',
		assigned_to: currentUserId,
		notes: ''
	};
}
