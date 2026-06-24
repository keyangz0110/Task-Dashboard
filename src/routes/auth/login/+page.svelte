<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { createClient } from '$lib/supabase/client';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { goto, invalidate } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function login(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const supabase = createClient();
		const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

		if (authError) {
			loading = false;
			error = authError.message;
			return;
		}

		if (!data.session) {
			loading = false;
			error = t($locale, 'authError');
			return;
		}

		await invalidate('supabase:auth');
		loading = false;
		goto('/');
	}
</script>

<div class="mx-auto max-w-md space-y-6">
	<h1 class="text-2xl font-bold">{t($locale, 'welcomeBack')}</h1>
	<form class="space-y-4 rounded-xl border border-border bg-card p-6" onsubmit={login}>
		<div class="space-y-2">
			<Label for="email">{t($locale, 'email')}</Label>
			<Input id="email" type="email" bind:value={email} required />
		</div>
		<div class="space-y-2">
			<Label for="password">{t($locale, 'password')}</Label>
			<Input id="password" type="password" bind:value={password} required />
		</div>
		{#if error}
			<p class="text-sm text-destructive">{error}</p>
		{/if}
		<Button type="submit" class="w-full" disabled={loading}>
			{loading ? t($locale, 'loading') : t($locale, 'login')}
		</Button>
	</form>
	<p class="text-center text-sm text-muted-foreground">
		{t($locale, 'needAccount')}
		<a href="/auth/signup" class="text-primary hover:underline">{t($locale, 'signup')}</a>
	</p>
</div>
