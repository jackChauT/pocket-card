import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddressLines, OrderItems } from '@/components/OrderParts';
import { DICTS } from '@/lib/dict';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { ADMIN_STATUS_LABEL, isPersonalised, ORDER_STATUSES, statusError } from '@/lib/orders';
import { getOrder, signedUrl } from '@/lib/server';
import { sendProof, setStatus } from '../../actions';

export default async function AdminOrder({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { lang, href } = await getT();
  const en = DICTS.en; // admin is English
  const order = await getOrder(id);
  if (!order || order.status === 'pending_payment') notFound();

  const personal = isPersonalised(order.lines);
  const photoLinks = Object.fromEntries(
    await Promise.all(order.lines.map(async (l) => [l.id, l.personalisation?.photoKey ? await signedUrl(l.personalisation.photoKey) : null])),
  );
  const proofUrl = order.proof_key ? await signedUrl(order.proof_key) : null;
  // Only offer statuses the rules allow from here.
  const options = ORDER_STATUSES.filter((s) => s === order.status || !statusError(order, s));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <Link href={href('/admin')} className="link self-start text-[13px] text-muted">← Orders</Link>
        <h1 className="display text-5xl">Order #{order.number}</h1>
        <p className="text-sm text-text-2">{formatDate(order.created_at, 'en')} · <strong className="font-medium text-ink">{ADMIN_STATUS_LABEL[order.status]}</strong></p>
      </div>

      {ok && <p role="status" className="bg-panel px-5 py-3 text-sm">{ok}</p>}
      {error && <p role="alert" className="border border-accent px-5 py-3 text-sm text-accent">{error}</p>}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-10">
          {personal && (
            <section aria-labelledby="sketch-title" className="flex flex-col gap-5 bg-panel p-6 md:p-8">
              <h2 id="sketch-title" className="font-serif text-[28px]">Sketch approval</h2>
              {order.status === 'changes_requested' && order.proof_feedback && (
                <div className="border-l-2 border-accent pl-4 text-sm leading-relaxed">
                  <div className="text-muted">Customer asked for changes:</div>“{order.proof_feedback}”
                </div>
              )}
              {proofUrl && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted">
                    Current sketch{order.proof_sent_at && `, sent ${formatDate(order.proof_sent_at, 'en')}`}{order.approved_at && ` · approved ${formatDate(order.approved_at, 'en')}`}
                  </span>
                  <a href={proofUrl} target="_blank" rel="noopener" className="self-start">
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
                    <img src={proofUrl} alt="Current sketch" className="art max-h-72 w-auto" />
                  </a>
                </div>
              )}
              <form action={sendProof} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="lang" value={lang} />
                <label htmlFor="sketch" className="label">{proofUrl ? 'Send a new sketch' : 'Upload the sketch'} <span className="font-normal text-muted">(JPG, PNG or WebP, up to 10 MB)</span></label>
                <input id="sketch" name="sketch" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm file:mr-4 file:h-11 file:rounded-[2px] file:border file:border-ink file:bg-transparent file:px-4" />
                <label htmlFor="message" className="label">Note to the customer <span className="font-normal text-muted">(optional)</span></label>
                <textarea id="message" name="message" rows={2} maxLength={1000} className="field" />
                <button className="btn btn-primary self-start">Send sketch for approval</button>
                <p className="text-[13px] text-muted">The customer gets an email with a link to approve it or ask for changes.</p>
              </form>
            </section>
          )}

          <section aria-labelledby="items-title" className="flex flex-col gap-5">
            <h2 id="items-title" className="display text-3xl">Items</h2>
            <OrderItems t={en} order={order} photoLinks={photoLinks} />
            <p className="text-[13px] text-muted">Photo links expire after 10 minutes; reload the page for fresh ones. HEIC photos download rather than open in some browsers.</p>
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          <form action={setStatus} className="flex flex-col gap-3 border border-line-input p-6">
            <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="lang" value={lang} />
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" defaultValue={order.status} className="field">
              {options.map((s) => <option key={s} value={s}>{ADMIN_STATUS_LABEL[s]}</option>)}
            </select>
            <label htmlFor="tracking" className="label">Tracking number <span className="font-normal text-muted">(emailed when shipped)</span></label>
            <input id="tracking" name="tracking" defaultValue={order.tracking ?? ''} className="field" />
            <button className="btn btn-primary">Update</button>
            {personal && !order.approved_at && (
              <p className="text-[13px] leading-relaxed text-muted">Printing unlocks once the customer approves the sketch. If they approved on WhatsApp, set “Sketch approved” first.</p>
            )}
          </form>

          <dl className="flex flex-col gap-5 text-sm leading-relaxed">
            <div><dt className="text-muted">Email</dt><dd className="[overflow-wrap:anywhere]"><a href={`mailto:${order.email}`} className="link underline">{order.email}</a>{order.newsletter && ' · newsletter opt-in'}</dd></div>
            <div><dt className="text-muted">Ship to</dt><dd><AddressLines t={en} lang="en" order={order} /></dd></div>
            <div><dt className="text-muted">Shipping method</dt><dd>{order.shipping_method.label}</dd></div>
            <div><dt className="text-muted">Customer language</dt><dd>{order.lang === 'zh-hk' ? 'Traditional Chinese (emails sent in Chinese)' : 'English'}</dd></div>
            <div><dt className="text-muted">Paid</dt><dd>{order.paid_at ? formatDate(order.paid_at, 'en') : 'Processing'}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
