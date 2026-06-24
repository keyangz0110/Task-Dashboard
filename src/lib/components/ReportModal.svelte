<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import DialogRoot from '$lib/components/ui/dialog-root.svelte';
	import DialogPortal from '$lib/components/ui/dialog-portal.svelte';
	import DialogOverlay from '$lib/components/ui/dialog-overlay.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogClose from '$lib/components/ui/dialog-close.svelte';
	import { locale } from '$lib/stores/locale';
	import { t, type Locale } from '$lib/i18n';

	interface Props {
		open: boolean;
		report: string;
		loading: boolean;
		reportLocale?: Locale;
		onClose: () => void;
		onGenerate: () => void;
	}

	let {
		open = $bindable(false),
		report,
		loading,
		reportLocale = $bindable<Locale>('en'),
		onClose,
		onGenerate
	}: Props = $props();

	let copied = $state(false);

	const reportLanguageItems = [
		{ value: 'en', label: 'English' },
		{ value: 'zh', label: '简体中文' },
		{ value: 'es', label: 'Español (LATAM)' }
	];

	let wasOpen = false;

	$effect(() => {
		if (open && !wasOpen) {
			reportLocale = $locale;
		}
		wasOpen = open;
	});

	async function copyReport() {
		await navigator.clipboard.writeText(report);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<DialogRoot bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
	<DialogPortal>
		<DialogOverlay />
		<DialogContent class="max-w-2xl">
			<DialogTitle class="mb-4">
				{t($locale, 'weeklyReport')}
			</DialogTitle>

			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="report-language">{t($locale, 'reportLanguage')}</Label>
					<SelectField
						id="report-language"
						bind:value={reportLocale}
						items={reportLanguageItems}
						disabled={loading}
						aria-label={t($locale, 'reportLanguage')}
					/>
				</div>

				<div class="flex gap-2">
					<DialogClose>{t($locale, 'cancel')}</DialogClose>
					<Button onclick={onGenerate} disabled={loading}>
						{loading ? t($locale, 'generating') : t($locale, 'generateReport')}
					</Button>
				</div>

				{#if report}
					<pre
						class="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed"
					>{report}</pre>
					<Button variant="secondary" onclick={copyReport}>
						{copied ? t($locale, 'reportCopied') : t($locale, 'copyReport')}
					</Button>
				{/if}
			</div>
		</DialogContent>
	</DialogPortal>
</DialogRoot>
