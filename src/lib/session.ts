import { db } from './server/db';
import { UserRole } from './types/models';

/**
 * The signed-in user for this browser. Set from the server's session when the
 * workspace loads (see WorkspaceSync); the server re-checks identity on every request.
 */

let currentUserId: string | null = null;

export function setSignedInUser(userId: string | null) {
  currentUserId = userId;
}

export function getCurrentUserId(): string {
  return currentUserId ?? 'usr_admin';
}

export function getActor(): { id: string; name: string; role: UserRole } {
  const id = getCurrentUserId();
  const user = db.users.find((u) => u.id === id) || db.users[0];
  const membership = db.memberships.find((m) => m.user_id === user?.id);
  return { id: user?.id ?? 'usr_admin', name: user?.name ?? 'Dev Administrator', role: membership?.role ?? 'admin' };
}

export async function signOut() {
  await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
  currentUserId = null;
  window.location.href = '/login';
}
