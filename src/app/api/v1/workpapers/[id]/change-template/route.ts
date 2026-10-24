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
    const result = services.changeTemplate(
      actor.firmId,
      actor,
      params.id,
      body.templateId,
      body.dryRun
    );
    await syncOut();
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}
