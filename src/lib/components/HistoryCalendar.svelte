<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import DatePickerField from '$lib/components/ui/date-picker-field.svelte';
	import TabsRoot from '$lib/components/ui/tabs-root.svelte';
	import TabsList from '$lib/components/ui/tabs-list.svelte';
	import TabsTrigger from '$lib/components/ui/tabs-trigger.svelte';
	import TabsContent from '$lib/components/ui/tabs-content.svelte';
	import HistoryActivityDetail from '$lib/components/HistoryActivityDetail.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, type TranslationKey } from '$lib/i18n';
	import {
		formatDateRange,
		formatWeekdayDate,
		getMonthRange,
		getWeekRange,
		isInRange,
		toDateInputValue
	} from '$lib/utils/dates';
	import {
		activityDay,
		getRangeActivities,
		historyActivityKey,
		type HistoryActivity,
		type HistoryActivityType
	} from '$lib/utils/history';
	import type { Task } from '$lib/supabase/types';
	import { parseISO } from 'date-fns';
	import { CalendarDays, CalendarRange, CheckCircle2, CirclePlus } from '@lucide/svelte';

	type HistoryView = 'week' | 'month' | 'custom';

	interface Props {
		tasks: Task[];
		currentUserId: string;
		reportRangeStart?: string;
		onReportRangeStartChange?: (value: string) => void;
	}

	let {
		tasks,
		currentUserId,
		reportRangeStart = $bindable(''),
		onReportRangeStartChange
	}: Props = $props();

	const initialWeek = getWeekRange(new Date());

	let view = $state<HistoryView>('week');
	let customStart = $state(toDateInputValue(initialWeek.start));
	let customEnd = $state(toDateInputValue(initialWeek.end));
	let selectedActivityKey = $state<string | null>(null);

	const activeRange = $derived.by(() => {
		const now = new Date();
		if (view === 'week') return getWeekRange(now, $locale);
		if (view === 'month') return getMonthRange(now);
		const start = parseISO(customStart);
		const end = parseISO(customEnd);
		return start <= end ? { start, end } : { start: end, end: start };
	});

	const rangeActivities = $derived(getRangeActivities(tasks, activeRange, isInRange));

	const selectedActivity = $derived(
		rangeActivities.find((activity) => historyActivityKey(activity) === selectedActivityKey) ??
			null
	);

	const activityTypeLabels: Record<HistoryActivityType, TranslationKey> = {
		created: 'created',
		completed: 'output'
	};

	const activityTypeIcons = {
		created: CirclePlus,
		completed: CheckCircle2
	} as const;

	$effect(() => {
		const weekStart = toDateInputValue(getWeekRange(activeRange.start, $locale).start);
		reportRangeStart = weekStart;
		onReportRangeStartChange?.(weekStart);
	});

	$effect(() => {
		view;
		customStart;
		customEnd;
		const activities = rangeActivities;
		if (activities.length === 0) {
			selectedActivityKey = null;
			return;
		}
		if (!activities.some((activity) => historyActivityKey(activity) === selectedActivityKey)) {
			selectedActivityKey = historyActivityKey(activities[0]);
		}
	});

	function selectActivity(activity: HistoryActivity) {
		selectedActivityKey = historyActivityKey(activity);
	}
</script>

<section class="flex min-h-[32rem] flex-col rounded-xl border border-border bg-card p-4 sm:p-5 lg:min-h-[36rem]">
	<div class="space-y-4 border-b border-border pb-4">
		<TabsRoot bind:value={view}>
			<TabsList class="h-auto w-full flex-wrap gap-1 sm:w-auto">
				<TabsTrigger value="week" class="gap-1.5 px-3 py-2">
					<CalendarDays class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'thisWeek')}
				</TabsTrigger>
				<TabsTrigger value="month" class="gap-1.5 px-3 py-2">
					<CalendarRange class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'thisMonth')}
				</TabsTrigger>
				<TabsTrigger value="custom" class="gap-1.5 px-3 py-2">
					<CalendarRange class="h-3.5 w-3.5" aria-hidden="true" />
					{t($locale, 'customRange')}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="custom" class="mt-4">
				<div class="flex flex-wrap gap-4">
					<div class="space-y-2">
						<Label for="history-from">{t($locale, 'from')}</Label>
						<DatePickerField id="history-from" bind:value={customStart} locale={$locale} />
					</div>
					<div class="space-y-2">
						<Label for="history-to">{t($locale, 'to')}</Label>
						<DatePickerField id="history-to" bind:value={customEnd} locale={$locale} />
					</div>
				</div>
			</TabsContent>
		</TabsRoot>

		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold">
				{formatDateRange(activeRange.start, activeRange.end, $locale)}
			</h3>
			<Badge variant="status">
				{t($locale, 'historyActivityCount', { count: rangeActivities.length })}
			</Badge>
		</div>
	</div>

	{#if rangeActivities.length === 0}
		<p
			class="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground"
		>
			{t($locale, 'noHistory')}
		</p>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col gap-4 pt-4 lg:flex-row">
			<div class="lg:w-64 lg:shrink-0">
				<p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{t($locale, 'historyActivities')}
				</p>
				<ul class="max-h-56 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
					{#each rangeActivities as activity (historyActivityKey(activity))}
						{@const key = historyActivityKey(activity)}
						{@const ActivityIcon = activityTypeIcons[activity.type]}
						<li>
							<button
								type="button"
								class="w-full rounded-lg border px-3 py-2.5 text-left transition-colors
									{selectedActivityKey === key
									? 'border-primary bg-primary/10'
									: 'border-border/70 bg-muted/35 hover:bg-accent'}"
								onclick={() => selectActivity(activity)}
								aria-pressed={selectedActivityKey === key}
							>
								<span
									class="mb-1 inline-flex items-center gap-1 text-xs font-medium {activity.type ===
									'completed'
										? 'text-status-done'
										: 'text-primary'}"
								>
									<ActivityIcon class="h-3.5 w-3.5" aria-hidden="true" />
									{t($locale, activityTypeLabels[activity.type])}
								</span>
								<span class="line-clamp-2 text-sm font-medium leading-snug">
									{activity.task.title}
								</span>
								<span class="mt-1 block text-xs text-muted-foreground">
									{formatWeekdayDate(activityDay(activity), $locale)}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border/70 bg-muted/20 p-4">
				{#if selectedActivity}
					<HistoryActivityDetail activity={selectedActivity} {currentUserId} />
				{:else}
					<p class="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
						{t($locale, 'historySelectActivity')}
					</p>
				{/if}
			</div>
		</div>
	{/if}
</section>
