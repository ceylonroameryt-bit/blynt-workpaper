import { syncIn, syncOut } from '@/lib/server/store';
import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const unlocked = services.unlockEngagement(actor.firmId, actor, params.id, body.reason);
    await syncOut();
    return jsonResponse(unlocked);
  } catch (err) {
    return errorResponse(err);
  }
}
