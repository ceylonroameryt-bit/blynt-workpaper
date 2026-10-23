import { NextResponse } from 'next/server';
import { services, ServiceError } from './services';
import { UserRole } from '../types/models';

export function getActorFromRequest(req: Request) {
  // Check header or default to Sam Rivera (Reviewer / Manager)
  const roleHeader = req.headers.get('x-user-role') as UserRole | null;
  const userIdHeader = req.headers.get('x-user-id');

  const { user, membership } = services.getCurrentUser(userIdHeader || undefined);
  if (roleHeader) {
    membership.role = roleHeader;
  }
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
  if (err instanceof ServiceError) {
    return jsonResponse({ error: err.message, code: err.code }, err.status);
  }
  console.error('API Error:', err);
  return jsonResponse({ error: err?.message || 'Internal Server Error' }, 500);
}
