import type { DurationType } from '$lib/supabase/types';

export function computePriorityScore(
	isUrgent: boolean,
	isImportant: boolean,
	durationType: DurationType,
	isRoutine: boolean
): number {
	const durationWeight = { short: 10, medium: 20, long: 30 }[durationType];
	const routineWeight = isRoutine ? 5 : 15;
	return (isUrgent ? 40 : 0) + (isImportant ? 30 : 0) + durationWeight + routineWeight;
}
