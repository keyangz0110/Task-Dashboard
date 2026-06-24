import type { Session, User } from '@supabase/supabase-js';

/** Session tokens only — never includes the unverified user from getSession(). */
export type VerifiedSession = Pick<
	Session,
	'access_token' | 'refresh_token' | 'expires_at' | 'expires_in' | 'token_type'
>;

export type SafeSessionResult = {
	session: VerifiedSession | null;
	user: User | null;
};

export function toVerifiedSession(session: Session): VerifiedSession {
	return {
		access_token: session.access_token,
		refresh_token: session.refresh_token,
		expires_at: session.expires_at,
		expires_in: session.expires_in,
		token_type: session.token_type
	};
}
