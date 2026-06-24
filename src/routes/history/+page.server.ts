import {
	fetchTasksFor
} from '$lib/supabase/tasks';
import type { UserRole } from '$lib/supabase/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
	const { user, profile } = await parent();

	if (!user) {
		return { tasks: [] };
	}

	const role = (profile?.role ?? 'contributor') as UserRole;
	const tasks = await fetchTasksFor(supabase, user.id, role);

	return { tasks };
};
