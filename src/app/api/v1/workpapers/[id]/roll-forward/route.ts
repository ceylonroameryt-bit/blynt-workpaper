import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (body.undo) {
      const undone = services.undoRollForward(actor.firmId, actor, params.id);
      return jsonResponse(undone);
    }
    const rolled = services.rollForwardPaper(actor.firmId, actor, params.id);
    return jsonResponse(rolled);
  } catch (err) {
    return errorResponse(err);
  }
}
