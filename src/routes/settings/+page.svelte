<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import { locale, setLocale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase/client';
	import { fetchProfiles, updateProfile } from '$lib/supabase/tasks';
	import type { Profile } from '$lib/supabase/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let profile = $state<Profile | null>(null);
	let displayName = $state('');
	let preferredLocale = $state<'en' | 'zh'>('en');
	let message = $state('');
	let saving = $state(false);

	onMount(async () => {
		const profiles = await fetchProfiles();
		profile = profiles.find((item) => item.id === data.user?.id) ?? null;
		if (profile) {
			displayName = profile.display_name;
			preferredLocale = profile.preferred_locale;
		}
	});

	async function save(e: Event) {
		e.preventDefault();
		if (!data.user) return;
		saving = true;
		await updateProfile(data.user.id, displayName, preferredLocale);
		setLocale(preferredLocale);
		message = t($locale, 'profileUpdated');
		saving = false;
	}
	const languageItems = [
		{ value: 'en', label: 'English' },
		{ value: 'zh', label: '简体中文' }
	];
</script>

<div class="mx-auto max-w-lg space-y-6">
	<h1 class="text-2xl font-bold">{t($locale, 'settings')}</h1>

	<form class="space-y-4 rounded-xl border border-border bg-card p-6" onsubmit={save}>
		<div class="space-y-2">
			<Label for="displayName">{t($locale, 'displayName')}</Label>
			<Input id="displayName" bind:value={displayName} required />
		</div>
		<div class="space-y-2">
			<Label for="language">{t($locale, 'language')}</Label>
			<SelectField
				id="language"
				bind:value={preferredLocale}
				items={languageItems}
				aria-label={t($locale, 'language')}
			/>
		</div>
		{#if message}
			<p class="text-sm text-status-done">{message}</p>
		{/if}
		<Button type="submit" disabled={saving}>
			{saving ? t($locale, 'loading') : t($locale, 'save')}
		</Button>
	</form>
</div>
