<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, taskCountLabel, type TranslationKey } from '$lib/i18n';
	import { CircleDot, Repeat } from '@lucide/svelte';
	import type { Task, TaskStatus } from '$lib/supabase/types';
	import { taskStatusIcons } from '$lib/utils/task-status';

	interface Props {
		isRoutine: boolean;
		tasks: Task[];
		currentUserId: string;
		canManage?: boolean;
		mobile?: boolean;
		onEdit?: (task: Task) => void;
		onDelete?: (task: Task) => void;
		onStatusChange: (taskId: string, status: TaskStatus) => void;
	}

	let {
		isRoutine,
		tasks,
		currentUserId,
		canManage = true,
		mobile = false,
		onEdit,
		onDelete,
		onStatusChange
	}: Props = $props();

	const columns: TaskStatus[] = ['todo', 'in_progress', 'done'];
	const statusLabels: Record<TaskStatus, TranslationKey> = {
		todo: 'statusTodo',
		in_progress: 'statusInProgress',
		done: 'statusDone'
	};
	const statusColors: Record<TaskStatus, string> = {
		todo: 'border-t-status-todo',
		in_progress: 'border-t-status-progress',
		done: 'border-t-status-done'
	};

	let columnItems = $state<Record<TaskStatus, Task[]>>({
		todo: [],
		in_progress: [],
		done: []
	});

	$effect(() => {
		columnItems = {
			todo: tasks.filter((task) => task.is_routine === isRoutine && task.status === 'todo'),
			in_progress: tasks.filter(
				(task) => task.is_routine === isRoutine && task.status === 'in_progress'
			),
			done: tasks.filter((task) => task.is_routine === isRoutine && task.status === 'done')
		};
	});

	function handleDnd(status: TaskStatus, e: CustomEvent<{ items: Task[] }>) {
		columnItems[status] = e.detail.items;
		const moved = e.detail.items.find((item) => item.status !== status);
		if (moved) {
			onStatusChange(moved.id, status);
		}
	}
</script>

<section class="space-y-4">
	<h2 class="inline-flex items-center gap-2 text-xl font-semibold">
		{#if isRoutine}
			<Repeat class="h-5 w-5 text-primary" aria-hidden="true" />
			{t($locale, 'routine')}
		{:else}
			<CircleDot class="h-5 w-5 text-primary" aria-hidden="true" />
			{t($locale, 'oneTime')}
		{/if}
	</h2>

	<div class="grid gap-4 lg:grid-cols-3">
		{#each columns as status (status)}
			{@const StatusIcon = taskStatusIcons[status]}
			<div
				class="rounded-xl border border-border bg-muted/30 border-t-4 {statusColors[status]} min-h-[280px]"
			>
				<div class="border-b border-border px-4 py-3">
					<h3 class="inline-flex items-center gap-2 font-medium">
						<StatusIcon class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
						{t($locale, statusLabels[status])}
					</h3>
					<p class="text-xs text-muted-foreground">
						{taskCountLabel($locale, columnItems[status].length)}
					</p>
				</div>

				{#if mobile}
					<div class="space-y-3 p-3">
						{#each columnItems[status] as task (task.id)}
							<TaskCard
								{task}
								{currentUserId}
								{canManage}
								mobile
								{onEdit}
								{onDelete}
								onStatusChange={(item, next) => onStatusChange(item.id, next)}
							/>
						{/each}
					</div>
				{:else}
					<div
						class="space-y-3 p-3"
						use:dndzone={{
							items: columnItems[status],
							flipDurationMs: 200,
							type: `${isRoutine}-${status}`
						}}
						onconsider={(e) => handleDnd(status, e)}
						onfinalize={(e) => handleDnd(status, e)}
					>
						{#each columnItems[status] as task (task.id)}
							<div animate:flip={{ duration: 200 }}>
								<TaskCard
									{task}
									{currentUserId}
									{canManage}
									{onEdit}
									{onDelete}
									onStatusChange={(item, next) => onStatusChange(item.id, next)}
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
