<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { formatDate } from '$lib/utils/dates';
	import { taskStatusIcons } from '$lib/utils/task-status';
	import type { DurationType, RoutineFrequency, Task, TaskStatus } from '$lib/supabase/types';
	import type { TranslationKey } from '$lib/i18n';
	import { Calendar, Clock, ListTodo, Pencil, Trash2, User } from '@lucide/svelte';

	interface Props {
		task: Task;
		currentUserId: string;
		canManage?: boolean;
		onEdit?: (task: Task) => void;
		onDelete?: (task: Task) => void;
		onStatusChange?: (task: Task, status: TaskStatus) => void;
		mobile?: boolean;
	}

	let {
		task,
		currentUserId,
		canManage = true,
		onEdit,
		onDelete,
		onStatusChange,
		mobile = false
	}: Props = $props();

	const isOverdue = $derived(
		task.due_date &&
			task.status !== 'done' &&
			new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10))
	);

	const assigneeName = $derived(
		task.assigned_to_profile?.display_name ??
			(task.assigned_to === currentUserId ? 'Me' : task.assigned_to)
	);

	const statusLabels: Record<TaskStatus, TranslationKey> = {
		todo: 'statusTodo',
		in_progress: 'statusInProgress',
		done: 'statusDone'
	};

	const statusItems = $derived(
		(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => ({
			value: status,
			label: t($locale, statusLabels[status]),
			icon: taskStatusIcons[status]
		}))
	);

	const frequencyLabels: Record<RoutineFrequency, TranslationKey> = {
		daily: 'frequencyDaily',
		weekly: 'frequencyWeekly',
		quarterly: 'frequencyQuarterly',
		yearly: 'frequencyYearly'
	};

	const routineLabel = $derived(
		task.is_routine && task.routine_frequency
			? t($locale, frequencyLabels[task.routine_frequency])
			: t($locale, 'routine')
	);

	const showStatusControl = $derived(Boolean(onStatusChange));
</script>

<article class="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
	<div class="mb-2 flex items-start justify-between gap-2">
		<h3 class="font-medium leading-snug">{task.title}</h3>
		{#if canManage && onEdit && onDelete}
			<div class="flex gap-1">
				<Button variant="ghost" size="icon" onclick={() => onEdit(task)} aria-label={t($locale, 'edit')}>
					<Pencil class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => onDelete(task)}
					aria-label={t($locale, 'delete')}
				>
					<Trash2 class="h-4 w-4 text-destructive" />
				</Button>
			</div>
		{/if}
	</div>

	<div class="mb-3 flex flex-wrap gap-1.5">
		{#if task.is_urgent}<Badge variant="urgent">{t($locale, 'urgent')}</Badge>{/if}
		{#if task.is_important}<Badge variant="important">{t($locale, 'important')}</Badge>{/if}
		{#if task.is_routine}<Badge variant="routine">{routineLabel}</Badge>{/if}
		{#if task.task_category}<Badge variant="status">{task.task_category.name}</Badge>{/if}
		<Badge variant="status">{t($locale, task.duration_type as DurationType)}</Badge>
	</div>

	<div class="space-y-1 text-xs text-muted-foreground">
		<p class="inline-flex items-center gap-1">
			<Calendar class="h-3.5 w-3.5" />
			{t($locale, 'createdAt')}: {formatDate(task.created_at, $locale)}
		</p>
		{#if task.due_date}
			<p class="inline-flex items-center gap-1 {isOverdue ? 'text-destructive' : ''}">
				<Clock class="h-3.5 w-3.5" />
				{t($locale, 'dueDate')}: {formatDate(task.due_date, $locale)}
				{#if isOverdue}
					· {t($locale, 'overdue')}
				{/if}
			</p>
		{/if}
		{#if task.assigned_to !== currentUserId || task.assigned_by !== currentUserId}
			<p class="inline-flex items-center gap-1">
				<User class="h-3.5 w-3.5" />
				{t($locale, 'assignee')}: {assigneeName}
			</p>
		{/if}
	</div>

	{#if task.notes}
		<p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{task.notes}</p>
	{/if}

	{#if showStatusControl && onStatusChange}
		<div class="mt-3 space-y-1">
			<p class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
				<ListTodo class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'status')}
			</p>
			<SelectField
				value={task.status}
				items={statusItems}
				onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
				aria-label={t($locale, 'status')}
			/>
		</div>
	{/if}
</article>
