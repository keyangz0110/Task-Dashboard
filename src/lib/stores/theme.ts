import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'task-dashboard-theme';

function readTheme(): Theme {
	if (!browser) return 'dark';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return 'dark';
}

function applyTheme(theme: Theme) {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const theme = writable<Theme>(readTheme());

export function setTheme(next: Theme) {
	theme.set(next);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
	}
}

export function initTheme() {
	applyTheme(get(theme));
}
