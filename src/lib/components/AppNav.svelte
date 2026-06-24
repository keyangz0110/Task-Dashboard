<script lang="ts">
	import { locale, setLocale } from '$lib/stores/locale';
	import {
		initTheme,
		resolvedTheme,
		setThemePreference,
		themePreference,
		type ThemePreference
	} from '$lib/stores/theme';
	import { t, type Locale } from '$lib/i18n';
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
		Check,
		Globe,
		History,
		LayoutDashboard,
		LogOut,
		Menu,
		Monitor,
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

	const languageOptions: { value: Locale; label: string }[] = [
		{ value: 'en', label: 'English' },
		{ value: 'zh', label: '简体中文' },
		{ value: 'es', label: 'Español (LATAM)' }
	];

	const themeOptions: {
		value: ThemePreference;
		labelKey: 'themeSystem' | 'themeLight' | 'themeDark';
		icon: typeof Sun;
	}[] = [
		{ value: 'system', labelKey: 'themeSystem', icon: Monitor },
		{ value: 'light', labelKey: 'themeLight', icon: Sun },
		{ value: 'dark', labelKey: 'themeDark', icon: Moon }
	];

	const linkClass =
		'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent data-[state=open]:bg-accent';

	const currentLanguageLabel = $derived(
		languageOptions.find((option) => option.value === $locale)?.label ?? 'English'
	);

	$effect(() => {
		initTheme();
	});

	async function logout() {
		const supabase = createClient();
		await supabase.auth.signOut();
		goto('/auth/login');
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
			<DropdownMenuRoot>
				<DropdownMenuTrigger class="gap-1.5 px-2" aria-label={t($locale, 'language')}>
					<Globe class="h-4 w-4" aria-hidden="true" />
					<span class="hidden text-sm sm:inline">{currentLanguageLabel}</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{#each languageOptions as option (option.value)}
						<DropdownMenuItem onSelect={() => setLocale(option.value)}>
							<span class="flex-1">{option.label}</span>
							{#if $locale === option.value}
								<Check class="h-4 w-4 text-primary" aria-hidden="true" />
							{/if}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenuRoot>

			<DropdownMenuRoot>
				<DropdownMenuTrigger
					class="size-9"
					aria-label={t($locale, 'theme')}
				>
					{#if $resolvedTheme === 'dark'}
						<Moon class="h-4 w-4" aria-hidden="true" />
					{:else}
						<Sun class="h-4 w-4" aria-hidden="true" />
					{/if}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{#each themeOptions as option (option.value)}
						<DropdownMenuItem onSelect={() => setThemePreference(option.value)}>
							<option.icon class="h-4 w-4" aria-hidden="true" />
							<span class="flex-1">{t($locale, option.labelKey)}</span>
							{#if $themePreference === option.value}
								<Check class="h-4 w-4 text-primary" aria-hidden="true" />
							{/if}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenuRoot>

			{#if user}
				<Button variant="ghost" size="sm" onclick={logout}>
					<LogOut class="h-4 w-4" />
					{t($locale, 'logout')}
				</Button>
			{/if}
		</div>
	</div>
</header>
