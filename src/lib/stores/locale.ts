import { browser } from '$app/environment';
import type { Locale } from '$lib/i18n';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'task-dashboard-locale';

export function getDocumentLang(locale: Locale): string {
	if (locale === 'zh') return 'zh-CN';
	if (locale === 'es') return 'es';
	return 'en';
}

function readLocale(): Locale {
	if (!browser) return 'en';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'en' || stored === 'zh' || stored === 'es') return stored;
	return 'en';
}

export const locale = writable<Locale>(readLocale());

export function setLocale(next: Locale) {
	locale.set(next);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, next);
		document.documentElement.lang = getDocumentLang(next);
	}
}
