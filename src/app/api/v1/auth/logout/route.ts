import { jsonResponse } from '@/lib/server/api-helpers';

export async function POST() {
  return jsonResponse({ success: true, message: 'Logged out successfully' });
}
