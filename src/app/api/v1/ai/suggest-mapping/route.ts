import { jsonResponse } from '@/lib/server/api-helpers';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const accountName = body.name || '';

  return jsonResponse({
    label: '✦ suggestion',
    suggested_blynt_code: '6000',
    confidence: 88,
    alternatives: [
      { blynt_code: '6000', name: 'Office Rent & Rates', reason: 'High linguistic match for corporate property facilities', confidence: 88 },
      { blynt_code: '6100', name: 'Light, Heat & Power', reason: 'Common secondary category for utility invoices', confidence: 72 },
      { blynt_code: '2100', name: 'Accruals', reason: 'Potential balance sheet accrued liability', confidence: 55 },
    ],
    notice: 'AI output changes nothing until accepted by a named user.',
  });
}
