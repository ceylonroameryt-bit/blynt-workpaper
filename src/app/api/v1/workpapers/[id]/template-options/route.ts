import { jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { db } from '@/lib/server/db';
import { services } from '@/lib/server/services';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { workpaper } = services.getWorkpaper(params.id);
    const eng = db.engagements.find((e) => e.id === workpaper.engagement_id);
    const client = db.clients.find((c) => c.id === eng?.client_id);

    // Filter templates valid for this area and company type
    const areaLetter = workpaper.ref.charAt(0);
    const templates = db.templates.filter(
      (t) =>
        t.area_letter === areaLetter &&
        (!client?.company_type || t.company_types.includes(client.company_type))
    );

    return jsonResponse(templates);
  } catch (err) {
    return errorResponse(err);
  }
}
