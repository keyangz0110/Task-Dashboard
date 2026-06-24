import en from './en.json';
import es from './es.json';
import zh from './zh.json';

export type Locale = 'en' | 'zh' | 'es';

const dictionaries = { en, zh, es } as const;

export type TranslationKey = keyof typeof en;

export function t(locale: Locale, key: TranslationKey, vars?: Record<string, string | number>) {
	let text: string = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
	if (vars) {
		for (const [name, value] of Object.entries(vars)) {
			text = text.replace(`{${name}}`, String(value));
		}
	}
	return text;
}

export function taskCountLabel(locale: Locale, count: number) {
	const key: TranslationKey = count === 1 ? 'taskCountOne' : 'taskCount';
	return t(locale, key, { count });
}

export { en, es, zh };
