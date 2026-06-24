import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'task-dashboard-theme';

function getSystemTheme(): ResolvedTheme {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readPreference(): ThemePreference {
	if (!browser) return 'system';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	return 'system';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
	return preference === 'system' ? getSystemTheme() : preference;
}

function applyResolved(resolved: ResolvedTheme) {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export const themePreference = writable<ThemePreference>(readPreference());
export const resolvedTheme = writable<ResolvedTheme>(resolveTheme(readPreference()));

/** @deprecated Use themePreference and resolvedTheme */
export const theme = resolvedTheme;

let mediaListenerAttached = false;

export function setThemePreference(next: ThemePreference) {
	themePreference.set(next);
	const resolved = resolveTheme(next);
	resolvedTheme.set(resolved);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, next);
		applyResolved(resolved);
	}
}

/** @deprecated Use setThemePreference */
export function setTheme(next: ResolvedTheme) {
	setThemePreference(next);
}

export function initTheme() {
	const preference = get(themePreference);
	const resolved = resolveTheme(preference);
	resolvedTheme.set(resolved);
	applyResolved(resolved);

	if (browser && !mediaListenerAttached) {
		mediaListenerAttached = true;
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (get(themePreference) === 'system') {
				const next = getSystemTheme();
				resolvedTheme.set(next);
				applyResolved(next);
			}
		});
	}
}
