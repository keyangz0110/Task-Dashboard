import { browser } from '$app/environment';
import type { Locale } from '$lib/i18n';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'task-dashboard-locale';

function readLocale(): Locale {
	if (!browser) return 'en';
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'zh' ? 'zh' : 'en';
}

export const locale = writable<Locale>(readLocale());

export function setLocale(next: Locale) {
	locale.set(next);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, next);
		document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
	}
}
