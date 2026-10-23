import { jsonResponse } from '@/lib/server/api-helpers';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = body.code || '';
  if (code.length === 6) {
    return jsonResponse({ success: true, verified: true });
  }
  return jsonResponse({ error: 'Invalid 6-digit TOTP code' }, 400);
}
