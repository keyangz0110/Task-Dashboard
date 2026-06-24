<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import SelectField from '$lib/components/ui/select-field.svelte';
	import { locale, setLocale } from '$lib/stores/locale';
	import {
		setThemePreference,
		themePreference,
		type ThemePreference
	} from '$lib/stores/theme';
	import { t, type Locale } from '$lib/i18n';
	import { fetchProfiles, updateProfile } from '$lib/supabase/tasks';
	import { isSupervisor } from '$lib/supabase/roles';
	import type { Profile } from '$lib/supabase/types';
	import type { PageData } from './$types';
	import { ChevronRight, FolderCog } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	let profile = $state<Profile | null>(null);
	let displayName = $state('');
	let preferredLocale = $state<Locale>('en');
	let preferredTheme = $state<ThemePreference>('system');
	let message = $state('');
	let saving = $state(false);

	const supervisor = $derived(isSupervisor(data.profile?.role));

	onMount(async () => {
		const profiles = await fetchProfiles();
		profile = profiles.find((item) => item.id === data.user?.id) ?? null;
		if (profile) {
			displayName = profile.display_name;
			preferredLocale = profile.preferred_locale;
		}
		preferredTheme = get(themePreference);
	});

	async function save(e: Event) {
		e.preventDefault();
		if (!data.user) return;
		saving = true;
		await updateProfile(data.user.id, displayName, preferredLocale);
		setLocale(preferredLocale);
		setThemePreference(preferredTheme);
		message = t($locale, 'profileUpdated');
		saving = false;
	}
	const languageItems = [
		{ value: 'en', label: 'English' },
		{ value: 'zh', label: '简体中文' },
		{ value: 'es', label: 'Español (LATAM)' }
	];

	const themeItems = $derived([
		{ value: 'system', label: t($locale, 'themeSystem') },
		{ value: 'light', label: t($locale, 'themeLight') },
		{ value: 'dark', label: t($locale, 'themeDark') }
	]);
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
		<div class="space-y-2">
			<Label for="theme">{t($locale, 'theme')}</Label>
			<SelectField
				id="theme"
				bind:value={preferredTheme}
				items={themeItems}
				aria-label={t($locale, 'theme')}
			/>
		</div>
		{#if message}
			<p class="text-sm text-status-done">{message}</p>
		{/if}
		<Button type="submit" disabled={saving}>
			{saving ? t($locale, 'loading') : t($locale, 'save')}
		</Button>
	</form>

	{#if supervisor}
		<div class="space-y-2">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
				{t($locale, 'supervisorSettings')}
			</h2>
			<a
				href="/settings/categories"
				class="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
			>
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
				>
					<FolderCog class="h-5 w-5" aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="font-medium">{t($locale, 'manageCategories')}</p>
					<p class="text-sm text-muted-foreground">{t($locale, 'manageCategoriesDescription')}</p>
				</div>
				<ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
			</a>
		</div>
	{/if}
</div>
