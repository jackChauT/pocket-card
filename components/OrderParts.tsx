// Order display shared by confirmation, account and admin pages.
// Takes the dictionary explicitly: customer pages pass theirs, admin passes English.
import { countryName, HK_REGIONS, hkd } from '@/lib/catalog';
import type { Dict } from '@/lib/dict';
import type { Lang } from '@/lib/i18n';
import { isPersonalised, timeline, type Order } from '@/lib/orders';
import { Thumb } from './ui';

type T = { t: Dict; order: Order };

export function OrderTimeline({ t, order }: T) {
  const { steps, current } = timeline(order.status, isPersonalised(order.lines));
  return (
    <ol className={`grid gap-5 md:gap-0 ${steps.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
      {steps.map((s, i) => {
        const done = i <= current;
        const [label, note] = t.timeline[s.key];
        return (
          <li key={s.key} aria-current={i === current ? 'step' : undefined} className="flex gap-3.5 md:flex-col">
            <div className="flex items-center pt-1 md:pt-0">
              <span className={`shrink-0 rounded-full ${done ? 'size-3.5 bg-accent' : 'size-3 border border-[#8f877c]'}`} />
              {i < steps.length - 1 && <span className="hidden h-px grow bg-[#cfc5b7] md:block" />}
            </div>
            <div className="flex flex-col gap-1 md:pr-4">
              <span className={`text-[15px] ${i === current ? 'font-medium' : ''}`}>{label}</span>
              <span className="text-[13px] text-muted">{note}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** `photoLinks` (admin only): signed URLs for customer photos, keyed by line id. */
export function OrderItems({ t, order, photoLinks }: T & { photoLinks?: Record<string, string | null> }) {
  const i = t.items;
  return (
    <>
      <ul className="flex flex-col border-t border-line">
        {order.lines.map((l) => {
          const p = l.personalisation;
          const link = photoLinks?.[l.id];
          return (
            <li key={l.id} className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-4 border-b border-line py-6 md:grid-cols-[88px_minmax(0,1fr)_auto] md:gap-5">
              <Thumb variant={l.variant} size="w-[72px] md:w-[88px]" />
              <div className="flex flex-col gap-1 text-sm leading-normal">
                <span className="text-base font-medium">{t.product.name}</span>
                <span className="text-muted">{t.variant[l.variant]} · {t.checkout.qty(l.quantity)}</span>
                {p && (
                  <span className="[overflow-wrap:anywhere]">
                    {i.photo}: {p.method === 'whatsapp' ? i.viaWhatsApp : link ? <a href={link} target="_blank" rel="noopener" className="link underline">{p.photoName}</a> : p.photoName}
                  </span>
                )}
                {p?.notes && <span className="text-text-2">{i.notes}: “{p.notes}”</span>}
              </div>
              <span className="text-[15px]">{hkd(l.unitHKD * l.quantity)}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between"><span className="text-text-2">{i.subtotal}</span><span>{hkd(order.subtotal_hkd)}</span></div>
        <div className="flex justify-between"><span className="text-text-2">{i.shipping}</span><span>{hkd(order.shipping_hkd)}</span></div>
        <div className="flex items-baseline justify-between border-t border-line pt-3.5">
          <span className="text-base font-medium">{order.paid_at ? i.totalPaid : i.total}</span><span className="text-xl">{hkd(order.total_hkd)}</span>
        </div>
      </div>
    </>
  );
}

export function AddressLines({ t, lang, order }: T & { lang: Lang }) {
  const a = order.shipping_address;
  const hk = order.country === 'HK';
  const region = t.regions[HK_REGIONS.indexOf(a.region)] ?? a.region;
  return (
    <>
      {a.firstName} {a.lastName}<br />{a.line1}<br />
      {a.line2}{hk ? `, ${a.area}` : ''}<br />
      {hk ? <>{region}<br /></> : <>{a.city} {a.postcode}<br /></>}
      {countryName(order.country, lang)}<br />{a.phone}
    </>
  );
}

/** Shipping method name in the reader's language (stored label is English, for staff). */
export const methodLabel = (t: Dict, order: Order) => t.shipping[order.shipping_method.id]?.[0] ?? order.shipping_method.label;
