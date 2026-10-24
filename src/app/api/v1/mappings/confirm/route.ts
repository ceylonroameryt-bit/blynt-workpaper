import { syncIn, syncOut } from '@/lib/server/store';
import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(req: Request) {
  try {
    await syncIn();
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const { engagementId, ids } = body;
    const updated = services.confirmSelectedMappings(actor.firmId, actor, engagementId, ids);
    await syncOut();
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
