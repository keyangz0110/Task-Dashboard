import type { UserRole } from './types';

export function isSupervisor(role: UserRole | null | undefined): boolean {
	return role === 'supervisor';
}
