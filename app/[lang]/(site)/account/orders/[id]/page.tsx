import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AddressLines, methodLabel, OrderItems, OrderTimeline } from '@/components/OrderParts';
import { ChatIcon } from '@/components/ui';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/catalog';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { currentUser, getOrder, signedUrl } from '@/lib/server';
import { reviewProof } from '../../actions';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.order, robots: { index: false } };
}

export default async function AccountOrder({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang, t, href } = await getT();
  const a = t.account;
  const pr = t.proof;
  const { id } = await params;
  const { error } = await searchParams;
  const user = await currentUser();
  if (!user?.email) redirect(`${href('/account')}?next=${encodeURIComponent(href(`/account/orders/${id}`))}`);

  const order = await getOrder(id);
  if (!order || order.email !== user.email.toLowerCase() || order.status === 'pending_payment') notFound();

  const number = `#${order.number}`;
  const proofUrl = order.proof_key && ['proof_sent', 'changes_requested', 'approved'].includes(order.status) ? await signedUrl(order.proof_key) : null;

  return (
    <div className="flex flex-col items-center px-5 pb-20 pt-10 md:px-14 md:pb-[140px] md:pt-20">
      <div className="flex w-full max-w-[920px] flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-3">
          <Link href={href('/account')} className="link self-start text-[13px] text-muted">{a.back}</Link>
          <div className="eyebrow">{t.order.eyebrow(number, formatDate(order.created_at, lang))}</div>
          <h1 className="display text-[38px] md:text-[56px]">{t.status[order.status]}</h1>
        </div>

        {order.status === 'awaiting_photo' && (
          <section className="flex flex-col items-start gap-4 border border-line-input p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-[28px]">{a.sendPhotoTitle}</h2>
            <p className="text-sm leading-[1.65] text-text-2">{a.sendPhotoBody(number)}</p>
            <a href={whatsappLink(t.order.whatsappMessage(number))} target="_blank" rel="noopener" className="btn btn-secondary"><ChatIcon />{t.pdp.waButton}</a>
            <span className="text-[13px] text-muted">{WHATSAPP_DISPLAY}</span>
          </section>
        )}

        {proofUrl && (
          <section aria-labelledby="proof-title" className="grid gap-8 bg-panel p-5 md:grid-cols-[minmax(0,1fr)_320px] md:gap-10 md:p-10">
            <a href={proofUrl} target="_blank" rel="noopener" className="flex items-center justify-center bg-tile p-4" aria-label={pr.openFull}>
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not optimisable */}
              <img src={proofUrl} alt={pr.alt(number)} className="art max-h-[560px] w-auto" />
            </a>
            <div className="flex flex-col gap-4">
              <h2 id="proof-title" className="font-serif text-[28px] leading-[1.1]">
                {order.status === 'proof_sent' ? pr.ready : order.status === 'approved' ? pr.approved : pr.revising}
              </h2>
              {order.proof_message && <p className="text-sm leading-[1.65] text-text-2">“{order.proof_message}”</p>}

              {order.status === 'proof_sent' && (
                <>
                  <p className="text-sm leading-[1.65] text-text-2">{pr.check}</p>
                  <form action={reviewProof}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button name="decision" value="approve" className="btn btn-primary w-full">{pr.approve}</button>
                  </form>
                  <details className="border-t border-[#d9d0c3] pt-2" open={error === 'feedback'}>
                    <summary className="flex min-h-11 items-center text-[15px] font-medium hover:text-accent">{pr.request}</summary>
                    <form action={reviewProof} className="flex flex-col gap-3 pt-2">
                      <input type="hidden" name="id" value={order.id} />
                      <input type="hidden" name="lang" value={lang} />
                      <label htmlFor="feedback" className="label">{pr.what}</label>
                      <textarea id="feedback" name="feedback" rows={4} maxLength={1000} required className="field" placeholder={pr.placeholder} />
                      {error === 'feedback' && <p role="alert" className="text-sm text-accent">{pr.needFeedback}</p>}
                      <button name="decision" value="changes" className="btn btn-secondary">{pr.send}</button>
                    </form>
                  </details>
                </>
              )}
              {order.status === 'changes_requested' && (
                <p className="text-sm leading-[1.65] text-text-2">{pr.revisingBody(order.proof_feedback ?? '')}</p>
              )}
              {order.status === 'approved' && order.approved_at && (
                <p className="text-sm leading-[1.65] text-text-2">{pr.approvedOn(formatDate(order.approved_at, lang))}</p>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="progress-title" className="flex flex-col gap-7 bg-panel px-6 py-8 md:px-12 md:py-10">
          <h2 id="progress-title" className="text-[15px] font-medium">{a.progress}</h2>
          <OrderTimeline t={t} order={order} />
          {order.tracking && <p className="text-sm text-text-2">{a.tracking}: <strong className="font-medium text-ink">{order.tracking}</strong></p>}
        </section>

        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_280px] md:gap-16">
          <section aria-labelledby="items-title" className="flex flex-col gap-5">
            <h2 id="items-title" className="display text-3xl">{a.items}</h2>
            <OrderItems t={t} order={order} />
          </section>
          <dl className="flex flex-col gap-5 text-sm leading-relaxed md:pt-[58px]">
            <div><dt className="text-muted">{t.order.shipTo}</dt><dd><AddressLines t={t} lang={lang} order={order} /></dd></div>
            <div><dt className="text-muted">{t.order.method}</dt><dd>{methodLabel(t, order)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
