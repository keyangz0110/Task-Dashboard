import en from './en.json';
import zh from './zh.json';

export type Locale = 'en' | 'zh';

const dictionaries = { en, zh } as const;

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

export { en, zh };
