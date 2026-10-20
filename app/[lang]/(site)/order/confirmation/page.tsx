import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddressLines, methodLabel, OrderItems, OrderTimeline } from '@/components/OrderParts';
import { ChatIcon } from '@/components/ui';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';
import { isPersonalised, needsWhatsAppPhoto } from '@/lib/orders';
import { getOrder, stripe } from '@/lib/server';
import ClearCart from './ClearCart';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.confirmed, robots: { index: false } };
}

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { lang, t, href } = await getT();
  const o = t.order;
  const { session_id } = await searchParams;
  if (!session_id) notFound();
  const session = await stripe().checkout.sessions.retrieve(session_id).catch(() => null);
  const orderId = session?.metadata?.order_id;
  if (!orderId) notFound();
  const order = await getOrder(orderId);
  if (!order) notFound();

  const paid = session.payment_status === 'paid';
  const number = `#${order.number}`;

  return (
    <div className="flex flex-col items-center px-5 pb-20 pt-14 md:px-14 md:pb-[140px] md:pt-28">
      {paid && <ClearCart />}
      <div className="flex w-full max-w-[920px] flex-col gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-accent text-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5 L10 17 L19 7" /></svg>
          </div>
          <div className="eyebrow">{o.eyebrow(number, paid ? o.paid : o.processing)}</div>
          <h1 className="display max-w-[780px] text-[38px] leading-[1.05] text-balance md:text-[56px]">{o.h1}</h1>
          <p className="text-base leading-relaxed text-text-2 md:text-[17px]">
            {o.sentTo[0]}<strong className="font-medium text-ink">{order.email}</strong>{o.sentTo[1]}
          </p>
        </div>

        {needsWhatsAppPhoto(order.lines) && (
          <section aria-labelledby="wa-title" className="flex flex-col items-start gap-4 border border-line-input p-6 md:p-8">
            <h2 id="wa-title" className="font-serif text-2xl md:text-[28px]">{o.sendPhotoTitle}</h2>
            <p className="text-sm leading-[1.65] text-text-2">{o.sendPhotoBody(number)}</p>
            <a href={whatsappLink(o.whatsappMessage(number))} target="_blank" rel="noopener" className="btn btn-secondary"><ChatIcon />{t.pdp.waButton}</a>
            <span className="text-[13px] text-muted">{WHATSAPP_DISPLAY}</span>
          </section>
        )}

        <section aria-labelledby="next-title" className="flex flex-col gap-7 bg-panel px-6 py-8 md:px-12 md:py-10">
          <h2 id="next-title" className="text-[15px] font-medium">{o.next}</h2>
          <OrderTimeline t={t} order={order} />
          <p className="text-sm leading-relaxed text-text-2">{isPersonalised(order.lines) && o.sketchNote}{o.trackingNote}</p>
        </section>

        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-16">
          <section aria-labelledby="items-title" className="flex flex-col gap-5">
            <h2 id="items-title" className="display text-3xl">{o.items}</h2>
            <OrderItems t={t} order={order} />
          </section>
          <dl className="flex flex-col gap-5 text-sm leading-relaxed md:pt-[58px]">
            <div><dt className="text-muted">{o.number}</dt><dd>{number}</dd></div>
            <div><dt className="text-muted">{o.email}</dt><dd className="[overflow-wrap:anywhere]">{order.email}</dd></div>
            <div><dt className="text-muted">{o.shipTo}</dt><dd><AddressLines t={t} lang={lang} order={order} /></dd></div>
            <div><dt className="text-muted">{o.method}</dt><dd>{methodLabel(t, order)}</dd></div>
            <div><dt className="text-muted">{o.payment}</dt><dd>{paid ? o.paidVia : o.processingVia}</dd></div>
          </dl>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href={href(`/account/orders/${order.id}`)} className="btn btn-secondary">{o.track}</Link>
          <Link href={href('/shop')} className="btn btn-secondary">{o.continue}</Link>
        </div>
      </div>
    </div>
  );
}
