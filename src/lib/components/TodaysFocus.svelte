<script lang="ts">
	import TaskCard from '$lib/components/TaskCard.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, taskCountLabel } from '$lib/i18n';
	import type { Task, TaskStatus } from '$lib/supabase/types';
	import { Sparkles } from '@lucide/svelte';

	interface Props {
		tasks: Task[];
		currentUserId: string;
		canManage?: boolean;
		mobile?: boolean;
		onEdit?: (task: Task) => void;
		onDelete?: (task: Task) => void;
		onStatusChange: (taskId: string, status: TaskStatus) => void;
	}

	let {
		tasks,
		currentUserId,
		canManage = true,
		mobile = false,
		onEdit,
		onDelete,
		onStatusChange
	}: Props = $props();
</script>

<section
	class="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
	aria-labelledby="todays-focus-heading"
>
	<div
		class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
		aria-hidden="true"
	></div>

	<div class="relative flex flex-wrap items-start justify-between gap-4">
		<div class="flex items-start gap-3">
			<div
				class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
			>
				<Sparkles class="h-5 w-5" aria-hidden="true" />
			</div>
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<h2 id="todays-focus-heading" class="text-xl font-bold tracking-tight sm:text-2xl">
						{t($locale, 'openTasksToday')}
					</h2>
					<Badge variant="status" class="bg-primary/15 text-primary">
						{taskCountLabel($locale, tasks.length)}
					</Badge>
				</div>
				<p class="mt-1 text-sm text-muted-foreground">{t($locale, 'todaysFocusSubtitle')}</p>
			</div>
		</div>
	</div>

	{#if tasks.length === 0}
		<p class="relative mt-5 rounded-xl border border-dashed border-primary/20 bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
			{t($locale, 'todaysFocusEmpty')}
		</p>
	{:else}
		<div class="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each tasks as task (task.id)}
				<TaskCard
					{task}
					{currentUserId}
					{canManage}
					{mobile}
					{onEdit}
					{onDelete}
					onStatusChange={(item, next) => onStatusChange(item.id, next)}
				/>
			{/each}
		</div>
	{/if}
</section>
