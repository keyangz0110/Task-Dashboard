import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Profile } from '$lib/supabase/types';

export const load: LayoutServerLoad = async ({ depends, locals: { safeGetSession, supabase }, url }) => {
	depends('supabase:auth');
	const { session, user } = await safeGetSession();

	const isAuthRoute = url.pathname.startsWith('/auth');
	const isCallback = url.pathname === '/auth/callback';

	if (!user && !isAuthRoute) {
		redirect(303, '/auth/login');
	}

	if (user && isAuthRoute && !isCallback) {
		redirect(303, '/');
	}

	let profile: Profile | null = null;
	if (user) {
		const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
		profile = data as Profile | null;
	}

	return { session, user, profile };
};
