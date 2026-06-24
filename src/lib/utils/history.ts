import type { Task } from '$lib/supabase/types';

export type HistoryActivityType = 'created' | 'completed';

export interface HistoryActivity {
	type: HistoryActivityType;
	task: Task;
}

export function historyActivityKey(activity: HistoryActivity): string {
	return `${activity.type}-${activity.task.id}`;
}

export function activityDay(activity: HistoryActivity): string {
	return activity.type === 'created'
		? activity.task.created_at.slice(0, 10)
		: activity.task.completed_at!.slice(0, 10);
}

function sortActivities(activities: HistoryActivity[]) {
	return activities.sort((a, b) => {
		const aTime = a.type === 'created' ? a.task.created_at : a.task.completed_at!;
		const bTime = b.type === 'created' ? b.task.created_at : b.task.completed_at!;
		return bTime.localeCompare(aTime);
	});
}

export function getDayActivities(tasks: Task[], day: string): HistoryActivity[] {
	const activities: HistoryActivity[] = [];

	for (const task of tasks) {
		if (task.created_at.slice(0, 10) === day) {
			activities.push({ type: 'created', task });
		}
		if (task.completed_at?.slice(0, 10) === day) {
			activities.push({ type: 'completed', task });
		}
	}

	return sortActivities(activities);
}

export function getRangeActivities(
	tasks: Task[],
	range: { start: Date; end: Date },
	isInRange: (dateStr: string | null | undefined, range: { start: Date; end: Date }) => boolean
): HistoryActivity[] {
	const activities: HistoryActivity[] = [];

	for (const task of tasks) {
		if (isInRange(task.created_at, range)) {
			activities.push({ type: 'created', task });
		}
		if (isInRange(task.completed_at, range)) {
			activities.push({ type: 'completed', task });
		}
	}

	return sortActivities(activities);
}
