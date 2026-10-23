import { jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { services } from '@/lib/server/services';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const data = services.getAccountMappings(params.id);
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(err);
  }
}
