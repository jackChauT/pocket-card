// Returns a one-time signed URL; the browser PUTs the photo straight to private storage.
import { PHOTO_EXT } from '@/lib/checkout';
import { db, PHOTO_BUCKET } from '@/lib/server';

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  const ext = String(name ?? '').split('.').pop()?.toLowerCase() ?? '';
  if (!PHOTO_EXT.test(ext)) return Response.json({ error: 'Please choose a JPG, PNG or HEIC photo' }, { status: 400 });

  // ponytail: no rate limit on signed URLs; add one (e.g. Vercel Firewall) if the bucket gets abused.
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await db().storage.from(PHOTO_BUCKET).createSignedUploadUrl(key);
  if (error) return Response.json({ error: 'Upload is unavailable, please try again' }, { status: 500 });
  return Response.json({ key, url: data.signedUrl });
}
