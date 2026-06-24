<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';
	import { initTheme } from '$lib/stores/theme';
	import { locale, setLocale } from '$lib/stores/locale';
	import { browser } from '$app/environment';

	let { data, children } = $props();

	$effect(() => {
		initTheme();
		if (browser) {
			const stored = localStorage.getItem('task-dashboard-locale');
			if (stored === 'zh' || stored === 'en') setLocale(stored);
			document.documentElement.lang = $locale === 'zh' ? 'zh-CN' : 'en';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Task Dashboard</title>
</svelte:head>

<AppNav user={data.user} />

<main class="mx-auto max-w-7xl px-4 py-6">
	{@render children()}
</main>
