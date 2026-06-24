<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, type TranslationKey } from '$lib/i18n';
	import { formatDate } from '$lib/utils/dates';
	import { taskStatusIcons } from '$lib/utils/task-status';
	import type {
		DurationType,
		RoutineFrequency,
		Task,
		TaskStatus
	} from '$lib/supabase/types';
	import type { HistoryActivity, HistoryActivityType } from '$lib/utils/history';
	import {
		Calendar,
		CheckCircle2,
		CirclePlus,
		Clock,
		StickyNote,
		User
	} from '@lucide/svelte';

	interface Props {
		activity: HistoryActivity;
		currentUserId: string;
	}

	let { activity, currentUserId }: Props = $props();

	const task = $derived(activity.task);

	const isOverdue = $derived(
		task.due_date &&
			task.status !== 'done' &&
			new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10))
	);

	const assigneeName = $derived(
		task.assigned_to_profile?.display_name ??
			(task.assigned_to === currentUserId ? t($locale, 'historyAssigneeMe') : task.assigned_to)
	);

	const showAssignee = $derived(
		task.assigned_to !== currentUserId || task.assigned_by !== currentUserId
	);

	const statusLabels: Record<TaskStatus, TranslationKey> = {
		todo: 'statusTodo',
		in_progress: 'statusInProgress',
		done: 'statusDone'
	};

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

	const activityTypeLabels: Record<HistoryActivityType, TranslationKey> = {
		created: 'created',
		completed: 'output'
	};

	const activityTypeIcons = {
		created: CirclePlus,
		completed: CheckCircle2
	} as const;

	const StatusIcon = $derived(taskStatusIcons[task.status]);
	const ActivityIcon = $derived(activityTypeIcons[activity.type]);
</script>

<article class="space-y-4">
	<div class="flex flex-wrap items-start gap-2">
		<Badge
			variant={activity.type === 'completed' ? 'status' : 'status'}
			class={activity.type === 'completed'
				? 'bg-status-done/15 text-status-done'
				: 'bg-primary/15 text-primary'}
		>
			<ActivityIcon class="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
			{t($locale, activityTypeLabels[activity.type])}
		</Badge>
		<Badge variant="status" class="gap-1">
			<StatusIcon class="h-3.5 w-3.5" aria-hidden="true" />
			{t($locale, statusLabels[task.status])}
		</Badge>
	</div>

	<h3 class="text-xl font-semibold leading-snug">{task.title}</h3>

	<div class="flex flex-wrap gap-1.5">
		{#if task.is_urgent}<Badge variant="urgent">{t($locale, 'urgent')}</Badge>{/if}
		{#if task.is_important}<Badge variant="important">{t($locale, 'important')}</Badge>{/if}
		{#if task.is_routine}<Badge variant="routine">{routineLabel}</Badge>{/if}
		{#if task.task_category}<Badge variant="status">{task.task_category.name}</Badge>{/if}
		<Badge variant="status">{t($locale, task.duration_type as DurationType)}</Badge>
	</div>

	<div class="space-y-2 rounded-lg border border-border/70 bg-muted/35 p-3">
		<div class="flex items-center gap-3">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm"
			>
				<Calendar class="h-4 w-4" aria-hidden="true" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{t($locale, 'createdAt')}
				</p>
				<p class="text-sm font-semibold text-foreground">
					{formatDate(task.created_at, $locale)}
				</p>
			</div>
		</div>

		{#if activity.type === 'completed' && task.completed_at}
			<div class="flex items-center gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-status-done shadow-sm"
				>
					<CheckCircle2 class="h-4 w-4" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t($locale, 'historyCompletedAt')}
					</p>
					<p class="text-sm font-semibold text-foreground">
						{formatDate(task.completed_at, $locale)}
					</p>
				</div>
			</div>
		{/if}

		{#if task.due_date}
			<div class="flex items-center gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background shadow-sm {isOverdue
						? 'text-destructive'
						: 'text-primary'}"
				>
					<Clock class="h-4 w-4" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t($locale, 'dueDate')}
					</p>
					<p class="text-sm font-semibold {isOverdue ? 'text-destructive' : 'text-foreground'}">
						{formatDate(task.due_date, $locale)}
						{#if isOverdue}
							<span class="ml-1 text-xs font-medium">· {t($locale, 'overdue')}</span>
						{/if}
					</p>
				</div>
			</div>
		{/if}

		{#if showAssignee}
			<div class="flex items-center gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm"
				>
					<User class="h-4 w-4" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t($locale, 'assignee')}
					</p>
					<p class="truncate text-sm font-semibold text-foreground">{assigneeName}</p>
				</div>
			</div>
		{/if}
	</div>

	{#if task.notes}
		<div class="rounded-lg border border-border/70 bg-muted/35 p-3">
			<div class="flex items-start gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm"
				>
					<StickyNote class="h-4 w-4" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t($locale, 'notes')}
					</p>
					<p class="text-sm font-semibold text-foreground">{task.notes}</p>
				</div>
			</div>
		</div>
	{/if}
</article>
