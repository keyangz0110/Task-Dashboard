<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import KanbanBoard from '$lib/components/KanbanBoard.svelte';
	import TodaysFocus from '$lib/components/TodaysFocus.svelte';
	import TaskFormDialog from '$lib/components/TaskFormDialog.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { isSupervisor } from '$lib/supabase/roles';
	import type { Profile, SortDirection, SortField, Task, TaskCategory, TaskFormData, UserRole, WorkView } from '$lib/supabase/types';
	import {
		applyTaskFilters,
		createTask,
		deleteTask,
		filterByWorkView,
		groupTasksForDashboard,
		sortTasks,
		updateTask,
		updateTaskStatus,
		type TaskFilters
	} from '$lib/supabase/tasks';
	import { Plus } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let tasks = $state<Task[]>([]);
	let profiles = $state<Profile[]>([]);
	let categories = $state<TaskCategory[]>([]);
	let dialogOpen = $state(false);
	let editingTask = $state<Task | null>(null);
	let workView = $state<WorkView>('all');
	let sortField = $state<SortField>('priority_score');
	let sortDirection = $state<SortDirection>('desc');
	let filters = $state<TaskFilters>({});
	let mobile = $state(false);

	const userId = $derived(data.user?.id ?? '');
	const role = $derived((data.profile?.role ?? 'contributor') as UserRole);
	const supervisor = $derived(isSupervisor(role));

	$effect(() => {
		tasks = data.tasks;
		profiles = data.profiles;
		categories = data.categories;
	});

	$effect(() => {
		if (!supervisor) {
			workView = 'mine';
		}
	});

	const visibleTasks = $derived.by(() => {
		let result = filterByWorkView(tasks, userId, workView, role);
		result = applyTaskFilters(result, filters);
		return sortTasks(result, sortField, sortDirection);
	});

	const todaysFocusTasks = $derived(
		groupTasksForDashboard(filterByWorkView(tasks, userId, workView, role))
			.todayTasks.filter((task) => task.status !== 'done')
			.sort((a, b) => b.priority_score - a.priority_score)
	);

	const filterCategories = $derived.by(() => {
		if (categories.length > 0) {
			return categories;
		}
		const byId = new Map<string, TaskCategory>();
		for (const task of tasks) {
			if (task.task_category) {
				byId.set(task.task_category.id, task.task_category);
			}
		}
		return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	onMount(() => {
		mobile = window.matchMedia('(max-width: 768px)').matches;
	});

	function openCreate() {
		editingTask = null;
		dialogOpen = true;
	}

	function openEdit(task: Task) {
		editingTask = task;
		dialogOpen = true;
	}

	async function handleSave(form: TaskFormData) {
		if (editingTask) {
			const updated = await updateTask(editingTask.id, form, userId);
			tasks = tasks.map((task) => (task.id === updated.id ? updated : task));
		} else {
			const created = await createTask(userId, form);
			tasks = [created, ...tasks];
		}
	}

	function handleCategoryCreated(category: TaskCategory) {
		categories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name));
	}

	async function handleDelete(task: Task) {
		if (!confirm(t($locale, 'confirmDelete'))) return;
		await deleteTask(task.id);
		tasks = tasks.filter((item) => item.id !== task.id);
	}

	async function handleStatusChange(taskId: string, status: Task['status']) {
		const updated = await updateTaskStatus(taskId, status);
		tasks = tasks.map((task) => (task.id === updated.id ? updated : task));
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-bold">{t($locale, 'dashboard')}</h1>
			<Badge variant="status">
				{t($locale, supervisor ? 'roleSupervisor' : 'roleContributor')}
			</Badge>
		</div>
		{#if supervisor}
			<Button onclick={openCreate}>
				<Plus class="h-4 w-4" />
				{t($locale, 'createTask')}
			</Button>
		{/if}
	</div>

	<TodaysFocus
		tasks={todaysFocusTasks}
		currentUserId={userId}
		canManage={supervisor}
		{mobile}
		onEdit={supervisor ? openEdit : undefined}
		onDelete={supervisor ? handleDelete : undefined}
		onStatusChange={handleStatusChange}
	/>

	<FilterBar
		bind:workView
		bind:sortField
		bind:sortDirection
		bind:filters
		categories={filterCategories}
		isSupervisor={supervisor}
		onWorkViewChange={(v) => (workView = v)}
		onSortFieldChange={(v) => (sortField = v)}
		onSortDirectionChange={(v) => (sortDirection = v)}
		onFiltersChange={(v) => (filters = v)}
		onClearFilters={() => (filters = {})}
	/>

	{#if visibleTasks.length === 0}
		<p class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
			{t($locale, 'noTasks')}
		</p>
	{:else}
		<KanbanBoard
			isRoutine={false}
			tasks={visibleTasks}
			currentUserId={userId}
			canManage={supervisor}
			{mobile}
			onEdit={supervisor ? openEdit : undefined}
			onDelete={supervisor ? handleDelete : undefined}
			onStatusChange={handleStatusChange}
		/>
		<KanbanBoard
			isRoutine={true}
			tasks={visibleTasks}
			currentUserId={userId}
			canManage={supervisor}
			{mobile}
			onEdit={supervisor ? openEdit : undefined}
			onDelete={supervisor ? handleDelete : undefined}
			onStatusChange={handleStatusChange}
		/>
	{/if}
</div>

{#if supervisor}
	<TaskFormDialog
		bind:open={dialogOpen}
		{profiles}
		{categories}
		currentUserId={userId}
		task={editingTask}
		onClose={() => (editingTask = null)}
		onSave={handleSave}
		onCategoryCreated={handleCategoryCreated}
	/>
{/if}
