import { NextResponse } from 'next/server';
import { ServiceError } from './services';
import { db } from './db';
import { readCookie, verifySessionToken } from './auth';
import { GuardError } from './state-guard';

/** The signed-in user, from the signed session cookie. Call after syncIn(). */
export function getActorFromRequest(req: Request) {
  const session = verifySessionToken(readCookie(req));
  if (!session) throw new ServiceError('Please sign in.', 401, 'UNAUTHENTICATED');
  const user = db.users.find((u) => u.id === session.uid);
  const membership = db.memberships.find((m) => m.user_id === session.uid);
  if (!user || !membership) throw new ServiceError('Your account no longer has access.', 401, 'UNAUTHENTICATED');
  return {
    id: user.id,
    name: user.name,
    role: membership.role,
    firmId: membership.firm_id,
  };
}

export function jsonResponse(data: any, status = 200, headers?: Record<string, string>) {
  // Stringify with bigint support if any
  const body = JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function errorResponse(err: any) {
  if (err instanceof GuardError) {
    return jsonResponse({ error: err.message, code: 'FORBIDDEN' }, 403);
  }
  if (err instanceof ServiceError) {
    return jsonResponse({ error: err.message, code: err.code }, err.status);
  }
  console.error('API Error:', err);
  return jsonResponse({ error: err?.message || 'Internal Server Error' }, 500);
}
