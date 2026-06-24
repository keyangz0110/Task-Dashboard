<script lang="ts">
	import { locale, setLocale } from '$lib/stores/locale';
	import { theme, initTheme, setTheme } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { createClient } from '$lib/supabase/client';
	import Button from '$lib/components/ui/button.svelte';
	import DropdownMenuRoot from '$lib/components/ui/dropdown-menu-root.svelte';
	import DropdownMenuTrigger from '$lib/components/ui/dropdown-menu-trigger.svelte';
	import DropdownMenuContent from '$lib/components/ui/dropdown-menu-content.svelte';
	import DropdownMenuItem from '$lib/components/ui/dropdown-menu-item.svelte';
	import MenubarRoot from '$lib/components/ui/menubar-root.svelte';
	import MenubarMenu from '$lib/components/ui/menubar-menu.svelte';
	import MenubarTrigger from '$lib/components/ui/menubar-trigger.svelte';
	import type { User } from '@supabase/supabase-js';
	import {
		History,
		LayoutDashboard,
		LogOut,
		Menu,
		Moon,
		Settings,
		Sun
	} from '@lucide/svelte';
	import type { TranslationKey } from '$lib/i18n';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();

	const navLinks: { href: string; label: TranslationKey; icon: typeof LayoutDashboard }[] = [
		{ href: '/', label: 'dashboard', icon: LayoutDashboard },
		{ href: '/history', label: 'history', icon: History },
		{ href: '/settings', label: 'settings', icon: Settings }
	];

	const linkClass =
		'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent data-[state=open]:bg-accent';

	$effect(() => {
		initTheme();
	});

	async function logout() {
		const supabase = createClient();
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	function toggleTheme() {
		setTheme(get(theme) === 'dark' ? 'light' : 'dark');
	}

	function toggleLocale() {
		setLocale(get(locale) === 'en' ? 'zh' : 'en');
	}

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
		<div class="flex items-center gap-4">
			<a href="/" class="text-lg font-semibold text-primary">{t($locale, 'appName')}</a>

			{#if user}
				<MenubarRoot class="hidden sm:flex">
					{#each navLinks as link (link.href)}
						<MenubarMenu value={link.href}>
							<MenubarTrigger>
								{#snippet child({ props })}
									<a
										{...props}
										href={link.href}
										class="{linkClass} {isActive(link.href)
											? 'bg-accent text-foreground'
											: 'text-foreground'}"
									>
										<link.icon class="h-4 w-4" aria-hidden="true" />
										{t($locale, link.label)}
									</a>
								{/snippet}
							</MenubarTrigger>
						</MenubarMenu>
					{/each}
				</MenubarRoot>

				<DropdownMenuRoot>
					<DropdownMenuTrigger class="sm:hidden" aria-label={t($locale, 'dashboard')}>
						<Menu class="h-5 w-5" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{#each navLinks as link (link.href)}
							<DropdownMenuItem onSelect={() => goto(link.href)}>
								<link.icon class="h-4 w-4" aria-hidden="true" />
								{t($locale, link.label)}
							</DropdownMenuItem>
						{/each}
					</DropdownMenuContent>
				</DropdownMenuRoot>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={toggleLocale}>
				{$locale === 'en' ? '中文' : 'EN'}
			</Button>
			<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label={t($locale, 'toggleTheme')}>
				{#if $theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</Button>
			{#if user}
				<Button variant="ghost" size="sm" onclick={logout}>
					<LogOut class="h-4 w-4" />
					{t($locale, 'logout')}
				</Button>
			{/if}
		</div>
	</div>
</header>
