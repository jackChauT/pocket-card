'use server';
// Studio actions. Every action re-checks admin: Server Actions are public endpoints.
import { redirect } from 'next/navigation';
import { DICTS } from '@/lib/dict';
import { button, esc, sendEmail } from '@/lib/email';
import { DEFAULT_LANG, isLang, type Lang } from '@/lib/i18n';
import { isPersonalised, statusError, type OrderStatus } from '@/lib/orders';
import { db, getOrder, PHOTO_BUCKET, requireAdmin, siteUrl } from '@/lib/server';

const MAX_SKETCH_BYTES = 10 * 1024 * 1024;
const SKETCH_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const langOf = (f: FormData): Lang => { const l = f.get('lang'); return isLang(l) ? l : DEFAULT_LANG; };

export async function sendProof(formData: FormData) {
  await requireAdmin();
  const adminLang = langOf(formData);
  const back = (id: string, q: string): never => redirect(`/${adminLang}/admin/orders/${id}?${q}`);
  const id = String(formData.get('id') ?? '');
  const file = formData.get('sketch');
  const message = String(formData.get('message') ?? '').trim().slice(0, 1000);

  const order = await getOrder(id);
  if (!order) redirect(`/${adminLang}/admin`);
  if (!isPersonalised(order.lines)) back(id, 'error=' + encodeURIComponent('Ready-made orders have no sketch step'));
  if (!(file instanceof File) || file.size === 0) back(id, 'error=' + encodeURIComponent('Choose a sketch image'));
  const sketch = file as File;
  const ext = SKETCH_TYPES[sketch.type];
  if (!ext) back(id, 'error=' + encodeURIComponent('Sketch must be a JPG, PNG or WebP image'));
  if (sketch.size > MAX_SKETCH_BYTES) back(id, 'error=' + encodeURIComponent('Sketch must be under 10 MB'));

  const key = `proofs/${id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await db().storage.from(PHOTO_BUCKET).upload(key, sketch, { contentType: sketch.type });
  if (uploadError) back(id, 'error=' + encodeURIComponent('Upload failed, please try again'));

  await db()
    .from('orders')
    .update({ status: 'proof_sent', proof_key: key, proof_message: message || null, proof_sent_at: new Date().toISOString(), approved_at: null })
    .eq('id', id);

  // Customer emails use the language they ordered in.
  const e = DICTS[order.lang].email;
  await sendEmail(
    order.email,
    e.proofSubject(`#${order.number}`),
    `<p>${esc(e.hello(order.shipping_address.firstName))}</p>
     <p>${e.proofBody}</p>
     ${message ? `<p><em>“${esc(message)}”</em></p>` : ''}
     ${button(`${siteUrl()}/${order.lang}/account/orders/${id}`, e.proofButton)}
     <p style="color:#6A6259;font-size:13px">${e.proofNote}</p>`,
    order.lang,
  );
  back(id, 'ok=' + encodeURIComponent('Sketch sent to the customer'));
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const adminLang = langOf(formData);
  const back = (id: string, q: string): never => redirect(`/${adminLang}/admin/orders/${id}?${q}`);
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('status') ?? '') as OrderStatus;
  const tracking = String(formData.get('tracking') ?? '').trim().slice(0, 120);

  const order = await getOrder(id);
  if (!order) redirect(`/${adminLang}/admin`);
  const problem = statusError(order, next);
  if (problem) back(id, 'error=' + encodeURIComponent(problem));

  const now = new Date().toISOString();
  await db()
    .from('orders')
    .update({
      status: next,
      tracking: tracking || order.tracking,
      ...(next === 'approved' && !order.approved_at ? { approved_at: now } : {}),
      ...(next === 'shipped' && order.status !== 'shipped' ? { shipped_at: now } : {}),
    })
    .eq('id', id);

  if (next === 'shipped' && order.status !== 'shipped') {
    const t = tracking || order.tracking;
    const d = DICTS[order.lang];
    const method = d.shipping[order.shipping_method.id]?.[0] ?? order.shipping_method.label;
    await sendEmail(
      order.email,
      d.email.shippedSubject(`#${order.number}`),
      `<p>${esc(d.email.hello(order.shipping_address.firstName))}</p>
       <p>${esc(d.email.shippedBody(method))}</p>
       ${t ? `<p>${d.email.trackingNumber}: <strong>${esc(t)}</strong></p>` : ''}
       ${button(`${siteUrl()}/${order.lang}/account/orders/${id}`, d.email.viewOrder)}`,
      order.lang,
    );
  }
  back(id, 'ok=' + encodeURIComponent('Status updated'));
}
