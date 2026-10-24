import { syncIn, syncOut } from '@/lib/server/store';
import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { db } from '@/lib/server/db';

export async function GET(
  req: Request,
  props: { params: Promise<{ key: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const pref = db.view_prefs.find((p) => p.user_id === actor.id && p.key === params.key) || {
      user_id: actor.id,
      scope: 'user',
      key: params.key,
      value_json: {
        showPriorYear: true,
        showChangePercent: true,
        showSource: true,
        showTickmarks: true,
        rowSpacing: 'comfortable',
        textSize: 'M',
        highContrast: false,
      },
    };
    return jsonResponse(pref);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ key: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json();

    let pref = db.view_prefs.find((p) => p.user_id === actor.id && p.key === params.key);
    if (!pref) {
      pref = {
        user_id: actor.id,
        scope: body.scope || 'user',
        key: params.key,
        value_json: body.value_json,
      };
      db.view_prefs.push(pref);
    } else {
      pref.value_json = body.value_json;
      if (body.scope) pref.scope = body.scope;
    }

    db.logAudit(actor.firmId, actor, 'UPDATE_VIEW_PREFS', 'view_prefs', params.key, null, pref);
    await syncOut();
    return jsonResponse(pref);
  } catch (err) {
    return errorResponse(err);
  }
}
