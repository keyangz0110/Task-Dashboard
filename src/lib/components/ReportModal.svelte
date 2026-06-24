<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import DialogRoot from '$lib/components/ui/dialog-root.svelte';
	import DialogPortal from '$lib/components/ui/dialog-portal.svelte';
	import DialogOverlay from '$lib/components/ui/dialog-overlay.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogClose from '$lib/components/ui/dialog-close.svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';

	interface Props {
		open: boolean;
		report: string;
		loading: boolean;
		onClose: () => void;
		onGenerate: () => void;
	}

	let { open = $bindable(false), report, loading, onClose, onGenerate }: Props = $props();

	let copied = $state(false);

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
				<Button onclick={onGenerate} disabled={loading}>
					{loading ? t($locale, 'generating') : t($locale, 'generateReport')}
				</Button>

				{#if report}
					<pre
						class="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed"
					>{report}</pre>
					<div class="flex gap-2">
						<Button variant="secondary" onclick={copyReport}>
							{copied ? t($locale, 'reportCopied') : t($locale, 'copyReport')}
						</Button>
						<DialogClose>{t($locale, 'cancel')}</DialogClose>
					</div>
				{/if}
			</div>
		</DialogContent>
	</DialogPortal>
</DialogRoot>
