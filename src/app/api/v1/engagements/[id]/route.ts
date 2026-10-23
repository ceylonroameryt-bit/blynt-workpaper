import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const engagement = services.getEngagement(actor.firmId, params.id);
    return jsonResponse(engagement);
  } catch (err) {
    return errorResponse(err);
  }
}
