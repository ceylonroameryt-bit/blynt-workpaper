import { jsonResponse } from '@/lib/server/api-helpers';
import { db } from '@/lib/server/db';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  // Return append-only audit trail
  const logs = db.audit_logs.slice().reverse();
  return jsonResponse(logs);
}
