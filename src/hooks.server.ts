import { createServerSupabase } from '$lib/supabase/server';
import { toVerifiedSession, type SafeSessionResult } from '$lib/supabase/session';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerSupabase(event.cookies);

	event.locals.safeGetSession = async (): Promise<SafeSessionResult> => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		return {
			session: toVerifiedSession(session),
			user
		};
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
