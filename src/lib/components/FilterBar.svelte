<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import TabsRoot from '$lib/components/ui/tabs-root.svelte';
	import TabsList from '$lib/components/ui/tabs-list.svelte';
	import TabsTrigger from '$lib/components/ui/tabs-trigger.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import type { RoutineFrequency, SortDirection, SortField, TaskCategory, TaskKind, WorkView } from '$lib/supabase/types';
	import type { TaskFilters } from '$lib/supabase/tasks';
	import {
		AlertTriangle,
		ArrowDown,
		ArrowUp,
		ArrowUpDown,
		Calendar,
		CalendarDays,
		CalendarRange,
		CircleDot,
		Clock,
		Eye,
		Filter,
		FolderPlus,
		Hourglass,
		Repeat,
		Star,
		Sun,
		Timer,
		User,
		UserPlus,
		Users,
		X
	} from '@lucide/svelte';

	interface Props {
		workView: WorkView;
		sortField: SortField;
		sortDirection: SortDirection;
		filters: TaskFilters;
		categories?: TaskCategory[];
		isSupervisor?: boolean;
		onWorkViewChange: (view: WorkView) => void;
		onSortFieldChange: (field: SortField) => void;
		onSortDirectionChange: (direction: SortDirection) => void;
		onFiltersChange: (filters: TaskFilters) => void;
		onClearFilters: () => void;
	}

	let {
		workView = $bindable('all'),
		sortField = $bindable('priority_score'),
		sortDirection = $bindable('desc'),
		filters = $bindable({}),
		categories = [],
		isSupervisor = true,
		onWorkViewChange,
		onSortFieldChange,
		onSortDirectionChange,
		onFiltersChange,
		onClearFilters
	}: Props = $props();

	const sortFieldItems = $derived([
		{ value: 'priority_score', label: t($locale, 'priority') },
		{ value: 'due_date', label: t($locale, 'dueDate') },
		{ value: 'created_at', label: t($locale, 'createdAt') }
	]);

	const sortDirectionItems = $derived([
		{ value: 'desc', label: t($locale, 'descending') },
		{ value: 'asc', label: t($locale, 'ascending') }
	]);

	const categoryItems = $derived([
		{ value: 'none', label: t($locale, 'noCategory') },
		...categories.map((category) => ({ value: category.id, label: category.name }))
	]);

	const categoryFilterValue = $derived(filters.category_id ?? '');

	const frequencyOptions: {
		value: RoutineFrequency;
		labelKey: 'frequencyDaily' | 'frequencyWeekly' | 'frequencyQuarterly' | 'frequencyYearly';
		icon: typeof Sun;
	}[] = [
		{ value: 'daily', labelKey: 'frequencyDaily', icon: Sun },
		{ value: 'weekly', labelKey: 'frequencyWeekly', icon: CalendarDays },
		{ value: 'quarterly', labelKey: 'frequencyQuarterly', icon: CalendarRange },
		{ value: 'yearly', labelKey: 'frequencyYearly', icon: Calendar }
	];

	const hasActiveFilters = $derived(
		Boolean(
			filters.urgent ||
				filters.important ||
				filters.duration ||
				filters.task_kind ||
				filters.routine_frequency ||
				filters.category_id
		)
	);

	function updateFilters(patch: Partial<TaskFilters>) {
		const next = { ...filters, ...patch };
		filters = next;
		onFiltersChange(next);
	}

	function toggleFilter(key: keyof TaskFilters, value?: boolean | string) {
		const next = { ...filters };
		if (key === 'duration') {
			next.duration = next.duration === value ? null : (value as TaskFilters['duration']);
		} else if (key === 'task_kind') {
			const kind = value as TaskKind;
			next.task_kind = next.task_kind === kind ? null : kind;
			if (next.task_kind !== 'routine') {
				next.routine_frequency = null;
			}
		} else if (key === 'routine_frequency') {
			next.routine_frequency =
				next.routine_frequency === value ? null : (value as RoutineFrequency);
			if (next.routine_frequency) {
				next.task_kind = 'routine';
			}
		} else if (key === 'urgent') {
			next.urgent = !next.urgent;
		} else if (key === 'important') {
			next.important = !next.important;
		}
		filters = next;
		onFiltersChange(next);
	}

	function setCategoryFilter(value: string) {
		updateFilters({ category_id: value || null });
	}
</script>

<div class="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5">
	<div class="flex items-center gap-2 border-b border-border pb-4">
		<Filter class="h-4 w-4 text-primary" aria-hidden="true" />
		<h2 class="text-sm font-semibold">{t($locale, 'filters')}</h2>
	</div>

	<div class="space-y-2">
		<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
			<Eye class="h-3.5 w-3.5" aria-hidden="true" />
			{t($locale, 'filterView')}
		</p>
		{#if isSupervisor}
			<TabsRoot bind:value={workView} onValueChange={(v) => onWorkViewChange(v as WorkView)}>
				<TabsList class="h-auto w-full flex-wrap gap-1 sm:w-auto">
					<TabsTrigger value="mine" class="gap-1.5 px-3 py-2">
						<User class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'myWork')}
					</TabsTrigger>
					<TabsTrigger value="delegated" class="gap-1.5 px-3 py-2">
						<UserPlus class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'delegated')}
					</TabsTrigger>
					<TabsTrigger value="all" class="gap-1.5 px-3 py-2">
						<Users class="h-3.5 w-3.5" aria-hidden="true" />
						{t($locale, 'allInvolved')}
					</TabsTrigger>
				</TabsList>
			</TabsRoot>
		{:else}
			<div
				class="inline-flex items-center gap-1.5 rounded-md bg-card px-3 py-2 text-sm font-medium shadow"
			>
				<User class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'myWork')}
			</div>
		{/if}
	</div>

	<div class="space-y-2">
		<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
			<ArrowUpDown class="h-3.5 w-3.5" aria-hidden="true" />
			{t($locale, 'filterSort')}
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<SelectField
				bind:value={sortField}
				items={sortFieldItems}
				class="w-40"
				onValueChange={(value) => onSortFieldChange(value as SortField)}
				aria-label={t($locale, 'sortBy')}
			/>
			<SelectField
				bind:value={sortDirection}
				items={sortDirectionItems}
				class="w-36"
				onValueChange={(value) => onSortDirectionChange(value as SortDirection)}
				aria-label={t($locale, 'sortBy')}
			/>
			<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
				{#if sortDirection === 'desc'}
					<ArrowDown class="h-3.5 w-3.5" aria-hidden="true" />
				{:else}
					<ArrowUp class="h-3.5 w-3.5" aria-hidden="true" />
				{/if}
				{sortDirection === 'desc' ? t($locale, 'descending') : t($locale, 'ascending')}
			</span>
		</div>
	</div>

	<div class="space-y-4">
		<div class="space-y-2">
			<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				<Star class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'filterPriority')}
			</p>
			<div class="flex flex-wrap gap-2">
				<Button
					variant={filters.urgent ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('urgent')}
				>
					<AlertTriangle class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'urgent')}
				</Button>
				<Button
					variant={filters.important ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('important')}
				>
					<Star class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'important')}
				</Button>
			</div>
		</div>

		<div class="space-y-2">
			<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				<Clock class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'filterDuration')}
			</p>
			<div class="flex flex-wrap gap-2">
				<Button
					variant={filters.duration === 'short' ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('duration', 'short')}
				>
					<Timer class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'short')}
				</Button>
				<Button
					variant={filters.duration === 'medium' ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('duration', 'medium')}
				>
					<Clock class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'medium')}
				</Button>
				<Button
					variant={filters.duration === 'long' ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('duration', 'long')}
				>
					<Hourglass class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'long')}
				</Button>
			</div>
		</div>

		<div class="space-y-2">
			<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				<Calendar class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'filterType')}
			</p>
			<div class="flex flex-wrap gap-2">
				<Button
					variant={filters.task_kind === 'one_time' ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('task_kind', 'one_time')}
				>
					<CircleDot class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'oneTime')}
				</Button>
				<Button
					variant={filters.task_kind === 'routine' ? 'default' : 'outline'}
					size="sm"
					class="gap-1.5"
					onclick={() => toggleFilter('task_kind', 'routine')}
				>
					<Repeat class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'routine')}
				</Button>
			</div>
			{#if filters.task_kind === 'routine'}
				<div class="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-3">
					<p class="w-full text-xs font-medium text-muted-foreground">
						{t($locale, 'routineFrequency')}
					</p>
					{#each frequencyOptions as option (option.value)}
						<Button
							variant={filters.routine_frequency === option.value ? 'default' : 'outline'}
							size="sm"
							class="gap-1.5"
							onclick={() => toggleFilter('routine_frequency', option.value)}
						>
							<option.icon class="h-3.5 w-3.5" aria-hidden="true" />
							{t($locale, option.labelKey)}
						</Button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="space-y-2">
			<p class="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				<FolderPlus class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'category')}
			</p>
			<SelectField
				value={categoryFilterValue}
				items={categoryItems}
				allowDeselect
				placeholder={t($locale, 'filterCategoryAll')}
				class="max-w-xs"
				onValueChange={setCategoryFilter}
				aria-label={t($locale, 'category')}
			/>
		</div>

		{#if hasActiveFilters}
			<Button variant="ghost" size="sm" class="gap-1.5" onclick={onClearFilters}>
				<X class="h-3.5 w-3.5" aria-hidden="true" />
				{t($locale, 'clearFilters')}
			</Button>
		{/if}
	</div>
</div>
