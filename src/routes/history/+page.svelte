<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import HistoryCalendar from '$lib/components/HistoryCalendar.svelte';
	import ReportModal from '$lib/components/ReportModal.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, type Locale } from '$lib/i18n';
	import { generateWeeklyReport } from '$lib/supabase/tasks';
	import { createClient } from '$lib/supabase/client';
	import { isSupervisor } from '$lib/supabase/roles';
	import { FileBarChart } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let reportRangeStart = $state('');
	let reportOpen = $state(false);
	let report = $state('');
	let reportLocale = $state<Locale>('en');

	let reportLoading = $state(false);

	const supervisor = $derived(isSupervisor(data.profile?.role));

	async function handleGenerateReport() {
		reportLoading = true;
		try {
			const supabase = createClient();
			const {
				data: { session }
			} = await supabase.auth.getSession();
			const accessToken = session?.access_token;
			if (!accessToken) throw new Error(t($locale, 'notAuthenticated'));
			if (!reportRangeStart) throw new Error(t($locale, 'reportGenerateFailed'));
			const result = await generateWeeklyReport(reportRangeStart, reportLocale, accessToken);
			report = result.report;
		} catch (err) {
			report = err instanceof Error ? err.message : t($locale, 'reportGenerateFailed');
		} finally {
			reportLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">{t($locale, 'history')}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{t($locale, 'historySubtitle')}</p>
		</div>
		{#if supervisor}
			<Button class="gap-1.5" onclick={() => (reportOpen = true)}>
				<FileBarChart class="h-4 w-4" aria-hidden="true" />
				{t($locale, 'generateReport')}
			</Button>
		{/if}
	</div>

	<HistoryCalendar
		tasks={data.tasks}
		currentUserId={data.user?.id ?? ''}
		bind:reportRangeStart
	/>
</div>

{#if supervisor}
	<ReportModal
		bind:open={reportOpen}
		bind:reportLocale
		{report}
		loading={reportLoading}
		onClose={() => (reportOpen = false)}
		onGenerate={handleGenerateReport}
	/>
{/if}
