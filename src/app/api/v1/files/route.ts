import crypto from 'crypto';
import { jsonResponse, errorResponse } from '@/lib/server/api-helpers';
import { saveFile } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

// Vercel functions accept request bodies up to 4.5 MB
const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Upload one file as the raw request body. Returns its storage key and fingerprint. */
export async function POST(req: Request) {
  try {
    const filename = decodeURIComponent(req.headers.get('x-filename') || 'file');
    const mime = req.headers.get('content-type') || 'application/octet-stream';
    const bytes = Buffer.from(await req.arrayBuffer());
    if (bytes.length === 0) return jsonResponse({ error: 'The file is empty.' }, 400);
    if (bytes.length > MAX_FILE_BYTES) {
      return jsonResponse({ error: 'Files can be up to 4 MB each.' }, 413);
    }
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const key = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    await saveFile({ id: key, mime, filename, sha256, bytes });
    return jsonResponse({ file_key: key, sha256, size: bytes.length, mime, filename }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
