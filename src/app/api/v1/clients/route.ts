import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function GET(req: Request) {
  try {
    const actor = getActorFromRequest(req);
    const clients = services.getClients(actor.firmId);
    return jsonResponse(clients);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const actor = getActorFromRequest(req);
    const body = await req.json();
    const client = services.createClient(actor.firmId, actor, body);
    return jsonResponse(client, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
