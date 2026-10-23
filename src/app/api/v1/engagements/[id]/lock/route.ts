import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const locked = services.lockEngagement(actor.firmId, actor, params.id);
    return jsonResponse(locked);
  } catch (err) {
    return errorResponse(err);
  }
}
