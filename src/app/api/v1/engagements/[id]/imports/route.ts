import { syncIn, syncOut } from '@/lib/server/store';
import { getActorFromRequest, jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { db } from '@/lib/server/db';
import { toPence } from '@/lib/money';
import crypto from 'crypto';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const actor = getActorFromRequest(req);
    const body = await req.json();

    const { lines, source = 'csv' } = body;
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      await syncOut();
      return jsonResponse({ error: 'No data lines provided' }, 400);
    }

    // Check duplicate codes and blank codes
    const codes = new Set<string>();
    const blankRows: number[] = [];
    let totalDebit = 0n;
    let totalCredit = 0n;

    lines.forEach((l: any, idx: number) => {
      if (!l.code || !l.code.trim()) {
        blankRows.push(idx + 1);
      } else {
        codes.add(l.code.trim());
      }
      totalDebit += toPence(l.debit);
      totalCredit += toPence(l.credit);
    });

    const difference = totalDebit - totalCredit;
    if (difference !== 0n) {
      await syncOut();
      return jsonResponse(
        {
          error: 'Unbalanced trial balance rejected: total debits must equal total credits.',
          difference_p: difference.toString(),
          total_debit_p: totalDebit.toString(),
          total_credit_p: totalCredit.toString(),
        },
        400
      );
    }

    if (blankRows.length > 0) {
      await syncOut();
      return jsonResponse(
        {
          error: `Blank account codes detected on lines ${blankRows.join(', ')}. Please fix or skip.`,
          blankRows,
        },
        400
      );
    }

    // Create immutable tb_snapshot with SHA-256
    const rawJson = JSON.stringify(lines);
    const sha256 = crypto.createHash('sha256').update(rawJson).digest('hex');

    const snapshot = {
      id: `snap_${Date.now()}`,
      engagement_id: params.id,
      source: source as any,
      as_at: new Date().toISOString().substring(0, 10),
      raw_json: rawJson,
      sha256,
      created_by: actor.id,
      created_at: new Date().toISOString(),
    };

    // Clear prior mappings for this engagement for a fresh import
    db.account_mappings = db.account_mappings.filter((m) => m.engagement_id !== params.id);

    // Populate tb_lines and account_mappings
    lines.forEach((l: any, idx: number) => {
      const lineId = `tbl_${Date.now()}_${idx + 1}`;
      const debitP = toPence(l.debit);
      const creditP = toPence(l.credit);
      const netBalance = debitP - creditP;

      db.tb_lines.push({
        id: lineId,
        snapshot_id: snapshot.id,
        source_code: l.code.trim(),
        source_name: l.name.trim(),
        source_type: l.type || 'General',
        debit_p: debitP.toString(),
        credit_p: creditP.toString(),
      });

      // Auto-suggest matching Blynt account if code matches standard chart
      const directMatch = db.blynt_accounts.find((ba) => ba.code === l.code.trim());
      const status = directMatch ? 'confirmed' : 'needs_you';
      const confidence = directMatch ? 100 : 40;

      db.account_mappings.push({
        id: `map_${Date.now()}_${idx + 1}`,
        engagement_id: params.id,
        source_code: l.code.trim(),
        source_name: l.name.trim(),
        source_type: l.type || 'General',
        balance_p: netBalance.toString(),
        blynt_code: directMatch ? directMatch.code : null,
        status,
        confidence,
        method: directMatch ? 'rule' : 'manual',
        confirmed_by: directMatch ? actor.id : null,
        confirmed_at: directMatch ? new Date().toISOString() : null,
        comment_count: 0,
      });
    });

    db.tb_snapshots.push(snapshot);
    db.logAudit(actor.firmId, actor, 'CREATE_SNAPSHOT', 'tb_snapshots', snapshot.id, null, {
      sha256,
      line_count: lines.length,
    });

    await syncOut();

    return jsonResponse({ success: true, snapshot, lineCount: lines.length }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await syncIn();
    const params = await props.params;
    const actor = getActorFromRequest(req);

    // Clear mappings and tb_snapshots for this engagement
    const priorCount = db.account_mappings.filter((m) => m.engagement_id === params.id).length;
    db.account_mappings = db.account_mappings.filter((m) => m.engagement_id !== params.id);
    db.tb_snapshots = db.tb_snapshots.filter((s) => s.engagement_id !== params.id);

    db.logAudit(actor.firmId, actor, 'CLEAR_TEST_DATA', 'engagements', params.id, null, {
      cleared_mappings: priorCount,
    });

    await syncOut();

    return jsonResponse({ success: true, cleared_count: priorCount });
  } catch (err) {
    return errorResponse(err);
  }
}
