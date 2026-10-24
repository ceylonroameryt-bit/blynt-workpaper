import { jsonResponse } from '@/lib/server/api-helpers';
import { clearSessionCookie } from '@/lib/server/auth';

export async function POST() {
  return jsonResponse({ success: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
