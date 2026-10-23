import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const wp = services.getWorkpaper(params.id);
    return jsonResponse(wp);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const updated = services.updateWorkpaperData(actor.firmId, actor, params.id, body.data_json);
    return jsonResponse(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
