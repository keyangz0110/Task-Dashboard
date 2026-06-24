import { CheckCircle2, Circle, LoaderCircle } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { TaskStatus } from '$lib/supabase/types';

export const taskStatusIcons = {
	todo: Circle,
	in_progress: LoaderCircle,
	done: CheckCircle2
} satisfies Record<TaskStatus, Component>;
