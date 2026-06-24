import {
	endOfMonth,
	endOfWeek,
	format,
	isWithinInterval,
	parseISO,
	startOfMonth,
	startOfWeek,
	type Locale
} from 'date-fns';
import { enUS, es, zhCN } from 'date-fns/locale';
import { parseDate, type DateValue } from '@internationalized/date';

export function getDateLocale(locale: string): Locale {
	if (locale === 'zh') return zhCN;
	if (locale === 'es') return es;
	return enUS;
}

export function getBitsLocale(locale: string): string {
	if (locale === 'zh') return 'zh-CN';
	if (locale === 'es') return 'es';
	return 'en-US';
}

export function stringToDateValue(value: string): DateValue | undefined {
	if (!value) return undefined;
	try {
		return parseDate(value);
	} catch {
		return undefined;
	}
}

export function dateValueToString(value: DateValue | undefined): string {
	if (!value) return '';
	const month = String(value.month).padStart(2, '0');
	const day = String(value.day).padStart(2, '0');
	return `${value.year}-${month}-${day}`;
}

export function formatDate(date: string | Date, locale: string, pattern?: string) {
	const value = typeof date === 'string' ? parseISO(date) : date;
	const resolvedPattern =
		pattern ?? (locale === 'zh' ? 'M月 d日, yyyy年' : 'MMM d, yyyy');
	return format(value, resolvedPattern, { locale: getDateLocale(locale) });
}

export function formatWeekdayDate(date: string | Date, locale: string) {
	const resolvedPattern = locale === 'zh' ? 'EEEE, M月 d日' : 'EEEE, MMM d';
	return formatDate(date, locale, resolvedPattern);
}

export function formatMonthYear(date: Date, locale: string) {
	const resolvedPattern = locale === 'zh' ? 'yyyy年M月' : 'MMMM yyyy';
	return format(date, resolvedPattern, { locale: getDateLocale(locale) });
}

export function formatDateRange(start: Date, end: Date, locale: string) {
	if (locale === 'zh') {
		return `${format(start, 'yyyy年M月d日', { locale: getDateLocale(locale) })} – ${format(end, 'yyyy年M月d日', { locale: getDateLocale(locale) })}`;
	}
	return `${format(start, 'MMM d, yyyy', { locale: getDateLocale(locale) })} – ${format(end, 'MMM d, yyyy', { locale: getDateLocale(locale) })}`;
}

export function getWeekRange(reference = new Date(), locale = 'en') {
	const options = { locale: getDateLocale(locale), weekStartsOn: 1 as const };
	return {
		start: startOfWeek(reference, options),
		end: endOfWeek(reference, options)
	};
}

export function getMonthRange(reference = new Date()) {
	return {
		start: startOfMonth(reference),
		end: endOfMonth(reference)
	};
}

export function isInRange(
	dateStr: string | null | undefined,
	range: { start: Date; end: Date }
): boolean {
	if (!dateStr) return false;
	const date = parseISO(dateStr);
	return isWithinInterval(date, range);
}

export function toDateInputValue(date = new Date()) {
	return format(date, 'yyyy-MM-dd');
}
