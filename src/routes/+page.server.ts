import {
	fetchCategoriesFor,
	fetchProfilesFor,
	fetchTasksFor
} from '$lib/supabase/tasks';
import { isSupervisor } from '$lib/supabase/roles';
import type { UserRole } from '$lib/supabase/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
	const { user, profile } = await parent();

	if (!user) {
		return { tasks: [], profiles: [], categories: [] };
	}

	const role = (profile?.role ?? 'contributor') as UserRole;
	const supervisor = isSupervisor(role);

	const [tasks, profiles, categories] = await Promise.all([
		fetchTasksFor(supabase, user.id, role),
		supervisor ? fetchProfilesFor(supabase) : Promise.resolve([]),
		supervisor ? fetchCategoriesFor(supabase, user.id) : Promise.resolve([])
	]);

	return { tasks, profiles, categories };
};
