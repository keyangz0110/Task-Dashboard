import { redirect } from '@sveltejs/kit';
import { fetchCategoriesFor } from '$lib/supabase/tasks';
import { isSupervisor } from '$lib/supabase/roles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
	const { user, profile } = await parent();

	if (!user || !isSupervisor(profile?.role)) {
		redirect(303, '/settings');
	}

	const categories = await fetchCategoriesFor(supabase, user.id);
	return { categories };
};
