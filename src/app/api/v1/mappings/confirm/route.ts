import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(req: Request) {
  try {
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const { engagementId, ids } = body;
    const updated = services.confirmSelectedMappings(actor.firmId, actor, engagementId, ids);
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
