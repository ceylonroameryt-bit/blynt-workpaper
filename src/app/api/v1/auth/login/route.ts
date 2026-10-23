import { jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { db } from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Rate limiting check simulation
    if (!email || !password) {
      return jsonResponse({ error: 'Email and password required' }, 400);
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || db.users[1]; // default Sam
    const membership = db.memberships.find((m) => m.user_id === user.id) || db.memberships[1];

    db.logAudit(membership.firm_id, { id: user.id, name: user.name, role: membership.role }, 'LOGIN', 'users', user.id, null, {
      method: 'password',
    });

    return jsonResponse({
      user,
      membership,
      requiresMfa: user.mfa_enabled,
      token: `sess_${user.id}_${Date.now()}`,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
