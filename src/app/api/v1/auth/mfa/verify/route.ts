import { jsonResponse } from '@/lib/server/api-helpers';

// TOTP is not implemented yet; never report a code as verified
export async function POST() {
  return jsonResponse({ error: 'Multi-factor verification is not available yet.', code: 'MFA_UNAVAILABLE' }, 501);
}
