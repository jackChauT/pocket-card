'use client';
import Link from 'next/link';
import { LockIcon, Stepper, Thumb } from '@/components/ui';
import { removeLine, updateLine, useCart } from '@/lib/cart';
import { hkd, product, unitPrice } from '@/lib/catalog';
import { useT } from '@/lib/i18n-client';

export default function CartView() {
  const { t, href } = useT();
  const c = t.cart;
  const lines = useCart();
  const subtotal = lines.reduce((s, l) => s + unitPrice(l.variant) * l.quantity, 0);
  const productUrl = href(`/shop/${product.slug}`);
  const stepperLabels = { group: t.pdp.quantity, decrease: t.pdp.decrease, increase: t.pdp.increase };

  return (
    <div className="flex flex-col gap-8 px-5 pb-20 pt-12 md:gap-12 md:px-14 md:pb-[140px] md:pt-[88px] xl:px-[152px]">
      <h1 className="display text-[46px] md:text-6xl">{c.h1}</h1>
      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-5 border-t border-line pt-10">
          <p className="text-[17px] text-text-2">{c.empty}</p>
          <Link href={href('/shop')} className="btn btn-primary">{c.shop}</Link>
        </div>
      ) : (
        <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-20">
          <ul className="flex flex-col border-t border-line">
            {lines.map((l) => {
              const p = l.personalisation;
              return (
                <li key={l.id} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-5 gap-y-4 border-b border-line py-6 md:grid-cols-[132px_minmax(0,1fr)_auto_auto] md:gap-7 md:py-8">
                  <Thumb variant={l.variant} size="w-[88px] md:w-[132px]" />
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Link href={productUrl} className="link text-[17px] font-medium">{t.product.name}</Link>
                    <div className="text-sm text-muted">{t.variant[l.variant]} · {c.each(hkd(unitPrice(l.variant)))}</div>
                    {p && (
                      <dl className="mt-2 grid grid-cols-[64px_minmax(0,1fr)] gap-y-1.5 text-sm leading-normal">
                        <dt className="text-muted">{c.photo}</dt><dd className="[overflow-wrap:anywhere]">{p.method === 'whatsapp' ? c.viaWhatsApp : p.photoName}</dd>
                        {p.notes && <><dt className="text-muted">{c.notes}</dt><dd>{p.notes}</dd></>}
                      </dl>
                    )}
                    <div className="mt-3 flex gap-5 text-sm">
                      {/* ponytail: Edit goes to the product page; in-place line editing when customers ask for it. */}
                      <Link href={productUrl} className="link flex min-h-11 items-center text-text-2 underline">{c.edit}</Link>
                      <button type="button" onClick={() => removeLine(l.id)} className="link min-h-11 text-text-2 underline">{c.remove}</button>
                    </div>
                  </div>
                  <div className="col-start-2 flex items-center justify-between md:contents">
                    <Stepper value={l.quantity} onChange={(quantity) => updateLine(l.id, { quantity })} size="sm" labels={stepperLabels} />
                    <div className="text-right text-base md:w-[88px] md:pt-2.5">{hkd(unitPrice(l.variant) * l.quantity)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <aside aria-label={c.summary} className="flex flex-col gap-5 bg-panel p-6 md:p-8">
            <div className="flex justify-between text-base"><span>{c.subtotal}</span><span>{hkd(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-muted"><span>{c.shipping}</span><span>{c.calculated}</span></div>
            <Link href={href('/checkout')} className="btn btn-primary mt-2 h-14">{c.checkout}</Link>
            <div className="flex items-center justify-center gap-2 text-[13px] text-muted">
              <LockIcon size={14} /><span>{c.secure}</span>
            </div>
            <Link href={href('/shop')} className="link flex min-h-11 items-center self-center text-sm underline">{c.continue}</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
