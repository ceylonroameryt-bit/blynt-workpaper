import { syncIn } from '@/lib/server/store';
import { jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const res = services.getEngagementBlockers(params.id);
    return jsonResponse(res);
  } catch (err) {
    return errorResponse(err);
  }
}
