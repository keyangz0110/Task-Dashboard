import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from './database.types';
import { supabaseKey, supabaseUrl } from './env';

export function createServerSupabase(cookies: Cookies) {
	return createServerClient<Database>(supabaseUrl, supabaseKey, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});
}
