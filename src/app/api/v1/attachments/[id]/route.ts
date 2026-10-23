import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const result = services.deleteAttachment(actor.firmId, actor, params.id);
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}
