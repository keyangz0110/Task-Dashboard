import type { User } from '@supabase/supabase-js';
import type { VerifiedSession } from '$lib/supabase/session';
import type { Profile } from '$lib/supabase/types';

declare global {
	namespace App {
		interface Locals {
			supabase: import('@supabase/supabase-js').SupabaseClient<
				import('$lib/supabase/database.types').Database
			>;
			safeGetSession: () => Promise<{
				session: VerifiedSession | null;
				user: User | null;
			}>;
		}
		interface PageData {
			session: VerifiedSession | null;
			user: User | null;
			profile: Profile | null;
		}
	}
}

export {};
