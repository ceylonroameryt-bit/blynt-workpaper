import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function POST(req: Request) {
  try {
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const engagement = services.createEngagement(actor.firmId, actor, body);
    return jsonResponse(engagement, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
