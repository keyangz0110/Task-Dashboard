<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import DatePickerField from '$lib/components/ui/date-picker-field.svelte';
	import AccordionRoot from '$lib/components/ui/accordion-root.svelte';
	import AccordionItem from '$lib/components/ui/accordion-item.svelte';
	import AccordionTrigger from '$lib/components/ui/accordion-trigger.svelte';
	import AccordionContent from '$lib/components/ui/accordion-content.svelte';
	import ReportModal from '$lib/components/ReportModal.svelte';
	import TabsRoot from '$lib/components/ui/tabs-root.svelte';
	import TabsList from '$lib/components/ui/tabs-list.svelte';
	import TabsTrigger from '$lib/components/ui/tabs-trigger.svelte';
	import TabsContent from '$lib/components/ui/tabs-content.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { formatDate, getMonthRange, getWeekRange, toDateInputValue } from '$lib/utils/dates';
	import { fetchTasks, generateWeeklyReport } from '$lib/supabase/tasks';
	import type { Task } from '$lib/supabase/types';
	import { isWithinInterval, parseISO } from 'date-fns';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let tasks = $state<Task[]>([]);
	let view = $state('week');
	let rangeStart = $state(toDateInputValue());
	let rangeEnd = $state(toDateInputValue());
	let reportOpen = $state(false);
	let report = $state('');
	let reportLoading = $state(false);

	const userId = $derived(data.user?.id ?? '');

	onMount(async () => {
		if (userId) tasks = await fetchTasks(userId);
		const { start, end } = getWeekRange(new Date(), $locale);
		rangeStart = toDateInputValue(start);
		rangeEnd = toDateInputValue(end);
	});

	const activeRange = $derived.by(() => {
		const now = new Date();
		if (view === 'week') return getWeekRange(now, $locale);
		if (view === 'month') return getMonthRange(now);
		return { start: parseISO(rangeStart), end: parseISO(rangeEnd) };
	});

	const filteredTasks = $derived(
		tasks.filter((task) => {
			const created = isWithinInterval(parseISO(task.created_at), activeRange);
			const completed = task.completed_at
				? isWithinInterval(parseISO(task.completed_at), activeRange)
				: false;
			return created || completed;
		})
	);

	const groupedByDay = $derived.by(() => {
		const map = new Map<string, { created: Task[]; completed: Task[] }>();
		for (const task of filteredTasks) {
			const createdDay = task.created_at.slice(0, 10);
			if (!map.has(createdDay)) map.set(createdDay, { created: [], completed: [] });
			if (isWithinInterval(parseISO(task.created_at), activeRange)) {
				map.get(createdDay)!.created.push(task);
			}
			if (task.completed_at && isWithinInterval(parseISO(task.completed_at), activeRange)) {
				const completedDay = task.completed_at.slice(0, 10);
				if (!map.has(completedDay)) map.set(completedDay, { created: [], completed: [] });
				map.get(completedDay)!.completed.push(task);
			}
		}
		return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
	});

	async function handleGenerateReport() {
		reportLoading = true;
		try {
			const accessToken = data.session?.access_token;
			if (!accessToken) throw new Error(t($locale, 'notAuthenticated'));
			const result = await generateWeeklyReport(
				activeRange.start.toISOString().slice(0, 10),
				$locale,
				accessToken
			);
			report = result.report;
		} catch (err) {
			report = err instanceof Error ? err.message : t($locale, 'reportGenerateFailed');
		} finally {
			reportLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-2xl font-bold">{t($locale, 'history')}</h1>
		<Button onclick={() => (reportOpen = true)}>{t($locale, 'generateReport')}</Button>
	</div>

	<TabsRoot bind:value={view}>
		<TabsList>
			<TabsTrigger value="week">{t($locale, 'thisWeek')}</TabsTrigger>
			<TabsTrigger value="month">{t($locale, 'thisMonth')}</TabsTrigger>
			<TabsTrigger value="custom">{t($locale, 'customRange')}</TabsTrigger>
		</TabsList>

		<TabsContent value="custom" class="mt-4">
			<div class="flex flex-wrap gap-4">
				<div class="space-y-2">
					<Label for="from">{t($locale, 'from')}</Label>
					<DatePickerField id="from" bind:value={rangeStart} locale={$locale} />
				</div>
				<div class="space-y-2">
					<Label for="to">{t($locale, 'to')}</Label>
					<DatePickerField id="to" bind:value={rangeEnd} locale={$locale} />
				</div>
			</div>
		</TabsContent>
	</TabsRoot>

	{#if groupedByDay.length === 0}
		<p class="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
			{t($locale, 'noHistory')}
		</p>
	{:else}
		<AccordionRoot>
			{#each groupedByDay as [day, groups] (day)}
				<AccordionItem value={day}>
					<AccordionTrigger>
						{formatDate(day, $locale, 'EEEE, MMM d')}
					</AccordionTrigger>
					<AccordionContent>
						<div class="space-y-4 text-foreground">
							{#if groups.created.length}
								<div>
									<h4 class="mb-2 font-medium">{t($locale, 'created')}</h4>
									<ul class="space-y-1">
										{#each groups.created as task}
											<li>• {task.title}</li>
										{/each}
									</ul>
								</div>
							{/if}
							{#if groups.completed.length}
								<div>
									<h4 class="mb-2 font-medium text-status-done">
										{t($locale, 'output')}
									</h4>
									<ul class="space-y-1">
										{#each groups.completed as task}
											<li>• {task.title}{task.notes ? ` — ${task.notes}` : ''}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</AccordionContent>
				</AccordionItem>
			{/each}
		</AccordionRoot>
	{/if}
</div>

<ReportModal
	bind:open={reportOpen}
	{report}
	loading={reportLoading}
	onClose={() => (reportOpen = false)}
	onGenerate={handleGenerateReport}
/>
