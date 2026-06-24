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
import { enUS, zhCN } from 'date-fns/locale';
import { parseDate, type DateValue } from '@internationalized/date';

export function getDateLocale(locale: string): Locale {
	return locale === 'zh' ? zhCN : enUS;
}

export function getBitsLocale(locale: string): string {
	return locale === 'zh' ? 'zh-CN' : 'en-US';
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

export function formatDate(date: string | Date, locale: string, pattern = 'MMM d, yyyy') {
	const value = typeof date === 'string' ? parseISO(date) : date;
	return format(value, pattern, { locale: getDateLocale(locale) });
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
