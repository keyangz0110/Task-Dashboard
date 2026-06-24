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
	let displayName = $state('');
	let error = $state('');
	let success = $state('');
	let loading = $state(false);

	async function signup(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		success = '';

		const supabase = createClient();
		const { data, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { display_name: displayName || email.split('@')[0] },
				emailRedirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (authError) {
			loading = false;
			error = authError.message;
			return;
		}

		if (!data.session) {
			loading = false;
			success = t($locale, 'confirmEmail');
			return;
		}

		await invalidate('supabase:auth');
		loading = false;
		goto('/');
	}
</script>

<div class="mx-auto max-w-md space-y-6">
	<h1 class="text-2xl font-bold">{t($locale, 'createAccount')}</h1>
	<form class="space-y-4 rounded-xl border border-border bg-card p-6" onsubmit={signup}>
		<div class="space-y-2">
			<Label for="displayName">{t($locale, 'displayName')}</Label>
			<Input id="displayName" bind:value={displayName} />
		</div>
		<div class="space-y-2">
			<Label for="email">{t($locale, 'email')}</Label>
			<Input id="email" type="email" bind:value={email} required />
		</div>
		<div class="space-y-2">
			<Label for="password">{t($locale, 'password')}</Label>
			<Input id="password" type="password" bind:value={password} minlength={6} required />
		</div>
		{#if error}
			<p class="text-sm text-destructive">{error}</p>
		{/if}
		{#if success}
			<p class="text-sm text-status-done">{success}</p>
		{/if}
		<Button type="submit" class="w-full" disabled={loading}>
			{loading ? t($locale, 'loading') : t($locale, 'signup')}
		</Button>
	</form>
	<p class="text-center text-sm text-muted-foreground">
		{t($locale, 'alreadyHaveAccount')}
		<a href="/auth/login" class="text-primary hover:underline">{t($locale, 'login')}</a>
	</p>
</div>
