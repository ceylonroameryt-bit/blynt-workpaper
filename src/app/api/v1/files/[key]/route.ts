import { readFile } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Serve an uploaded file inline, so PDFs and images open in the browser. */
export async function GET(req: Request, props: { params: Promise<{ key: string }> }) {
  const { key } = await props.params;
  const file = await readFile(key);
  if (!file) return new Response('File not found', { status: 404 });
  // Only types browsers render safely open inline; anything else (HTML, SVG, scripts) downloads
  const safeInline = /^(application\/pdf|image\/(png|jpe?g|gif|webp)|text\/(plain|csv))$/i.test(file.mime);
  const download = !safeInline || new URL(req.url).searchParams.has('download');
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'Content-Type': file.mime,
      'Content-Length': String(file.bytes.length),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      // The browser PDF viewer cannot run inside a sandbox, so PDFs are left out of it
      ...(file.mime === 'application/pdf'
        ? {}
        : { 'Content-Security-Policy': "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'" }),
    },
  });
}
