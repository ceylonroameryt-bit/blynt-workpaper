import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const updated = services.updateMapping(actor.firmId, actor, params.id, body.blynt_code);
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
