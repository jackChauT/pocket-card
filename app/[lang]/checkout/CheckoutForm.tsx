'use client';
import Link from 'next/link';
import { useState } from 'react';
import LanguageSwitch from '@/components/LanguageSwitch';
import { ChevronIcon, LockIcon, Thumb } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { countries, hkd, HK_REGIONS, priceOrder, shippingFor, STUDIO_NAME, unitPrice, type CartLine } from '@/lib/catalog';
import type { Address } from '@/lib/checkout';
import { serverError, type Dict } from '@/lib/dict';
import { useT } from '@/lib/i18n-client';

export type Saved = { email?: string; country?: string; address?: Address };

function Field({ id, label, hint, className = '', ...input }: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="label">{label}{hint && <span className="font-normal text-muted"> {hint}</span>}</label>
      <input id={id} name={id} className="field h-[54px] md:h-[52px]" required {...input} />
    </div>
  );
}

function Summary({ t, lines, subtotal, shipLabel, shipCost }: { t: Dict; lines: CartLine[]; subtotal: number; shipLabel: string; shipCost: number }) {
  return (
    <>
      <ul className="flex flex-col gap-4 md:gap-5">
        {lines.map((l) => (
          <li key={l.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-3 text-sm md:grid-cols-[72px_minmax(0,1fr)_auto] md:gap-4">
            <Thumb variant={l.variant} size="w-14 md:w-[72px]" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t.product.name}</span>
              <span className="text-muted">{t.variant[l.variant]} · {t.checkout.qty(l.quantity)}</span>
              {l.personalisation && (
                <span className="text-text-2 [overflow-wrap:anywhere]">
                  {l.personalisation.method === 'whatsapp' ? t.checkout.photoWhatsApp : t.checkout.photo(l.personalisation.photoName ?? '')}
                </span>
              )}
            </div>
            <span>{hkd(unitPrice(l.variant) * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 border-t border-[#d9d0c3] pt-4 text-sm md:pt-6">
        <div className="flex justify-between"><span className="text-text-2">{t.items.subtotal}</span><span>{hkd(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-text-2">{t.checkout.shipLine(shipLabel)}</span><span>{hkd(shipCost)}</span></div>
      </div>
    </>
  );
}

export default function CheckoutForm({ saved }: { saved: Saved }) {
  const { lang, t, href } = useT();
  const c = t.checkout;
  const lines = useCart();
  const a = saved.address;
  const [country, setCountry] = useState(saved.country ?? 'HK');
  const [method, setMethod] = useState(shippingFor(saved.country ?? 'HK')[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const methods = shippingFor(country);
  const current = methods.find((m) => m.id === method) ?? methods[0];
  const currentLabel = t.shipping[current.id][0];
  const { subtotal, total } = priceOrder(lines, country, current.id);
  const hk = country === 'HK';
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lang,
          lines,
          email: f.email,
          newsletter: f.newsletter === 'on',
          country,
          shippingMethod: current.id,
          address: {
            firstName: f.first, lastName: f.last, line1: f.addr1, line2: f.addr2,
            area: f.area, region: f.region, city: f.city, postcode: f.postcode, phone: f.phone,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(serverError(t, data.error));
      window.location.assign(data.url); // Stripe Checkout
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line px-5 md:h-[72px] md:px-14">
        <Link href={href('/')} className="display text-2xl text-ink md:text-[28px]">{STUDIO_NAME}</Link>
        <div className="flex items-center gap-5">
          <LanguageSwitch className="text-sm" />
          <span className="flex items-center gap-1.5 text-[13px] text-text-2 md:gap-2 md:text-sm"><LockIcon size={14} />{c.secure}</span>
        </div>
      </header>

      {lines.length === 0 ? (
        <main className="flex flex-col items-start gap-5 px-5 py-16 md:px-[152px]">
          <p className="text-[17px] text-text-2">{c.empty}</p>
          <Link href={href('/shop')} className="btn btn-primary">{t.cart.shop}</Link>
        </main>
      ) : (
        <main className="grid grow md:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_520px]">
          {/* Mobile: collapsible summary at the top */}
          <details className="border-b border-line bg-panel md:hidden">
            <summary className="flex min-h-14 items-center justify-between px-5 text-[15px]">
              <span className="flex items-center gap-2">{c.summaryToggle(count)}<ChevronIcon className="chev transition-transform" /></span>
              <span className="font-medium">{hkd(total)}</span>
            </summary>
            <div className="reveal flex flex-col gap-4 px-5 pb-5 pt-1"><Summary t={t} lines={lines} subtotal={subtotal} shipLabel={currentLabel} shipCost={current.cost} /></div>
          </details>

          <form onSubmit={onSubmit} className="flex flex-col gap-8 px-5 pb-32 pt-7 md:gap-12 md:pb-24 md:pl-14 md:pr-16 md:pt-14 xl:pl-[152px] xl:pr-24">
            <ol aria-label={c.progressLabel} className="hidden items-center gap-3.5 text-[13px] text-muted md:flex">
              {c.progress.map((step, i) => (
                <li key={step} className="contents">
                  {i > 0 && <span aria-hidden>—</span>}
                  {i === 0 ? <Link href={href('/cart')} className="link text-muted">{step}</Link>
                    : <span aria-current={i === 1 ? 'step' : undefined} className={i === 1 ? 'font-medium text-ink' : ''}>{step}</span>}
                </li>
              ))}
            </ol>

            <section aria-labelledby="c-contact" className="flex flex-col gap-3 md:gap-4">
              <div className="flex items-baseline justify-between">
                <h2 id="c-contact" className="display text-[26px] md:text-3xl">{c.contact}</h2>
                <span className="hidden text-[13px] text-muted md:inline">{c.contactNote}</span>
              </div>
              <Field id="email" label={c.email} type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" defaultValue={saved.email} />
              {!saved.email && (
                <p className="text-[13px] text-muted">
                  {c.signIn[0]}<Link href={`${href('/account')}?next=${encodeURIComponent(href('/checkout'))}`} className="link underline">{c.signIn[1]}</Link>{c.signIn[2]}
                </p>
              )}
              <label className="flex min-h-11 items-center gap-2.5 text-sm text-text-2">
                <input type="checkbox" name="newsletter" className="check" />
                {c.newsletter}
              </label>
            </section>

            <section aria-labelledby="c-ship" className="flex flex-col gap-3 md:gap-4">
              <h2 id="c-ship" className="display text-[26px] md:text-3xl">{c.address}</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="country" className="label">{c.country}</label>
                <select id="country" autoComplete="country" value={country} className="field h-[54px] md:h-[52px]"
                  onChange={(e) => { const next = e.target.value; setCountry(next); setMethod(shippingFor(next)[0].id); }}>
                  {countries(lang).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Field id="first" label={c.first} autoComplete="given-name" defaultValue={a?.firstName} />
                <Field id="last" label={c.last} autoComplete="family-name" defaultValue={a?.lastName} />
              </div>
              <Field id="addr1" label={c.line1} autoComplete="address-line1" defaultValue={a?.line1} />
              <Field id="addr2" label={c.line2} autoComplete="address-line2" defaultValue={a?.line2} />
              {hk ? (
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Field id="area" label={c.area} autoComplete="address-level3" defaultValue={a?.area} />
                  <div className="flex flex-col gap-2">
                    <label htmlFor="region" className="label">{c.region}</label>
                    <select id="region" name="region" autoComplete="address-level1" defaultValue={a?.region || undefined} className="field h-[54px] md:h-[52px]">
                      {/* Value stays English (what the server validates and the courier reads); label is localised. */}
                      {HK_REGIONS.map((r, i) => <option key={r} value={r}>{t.regions[i]}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-[2fr_1fr] md:gap-4">
                    <Field id="city" label={c.city} autoComplete="address-level2" defaultValue={a?.city} />
                    <Field id="postcode" label={c.postcode} autoComplete="postal-code" required={false} defaultValue={a?.postcode} />
                  </div>
                  <span className="text-[13px] leading-normal text-muted">{c.duties}</span>
                </>
              )}
              <Field id="phone" label={c.phone} hint={c.phoneHint} type="tel" autoComplete="tel" inputMode="tel" defaultValue={a?.phone ?? '+852 '} />
            </section>

            <section aria-labelledby="c-method" className="flex flex-col gap-3 md:gap-4">
              <h2 id="c-method" className="display text-[26px] md:text-3xl">{c.method}</h2>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">{c.method}</legend>
                {methods.map((m) => (
                  <label key={m.id} className="opt">
                    <input type="radio" name="ship" checked={m.id === current.id} onChange={() => setMethod(m.id)} />
                    <span className="flex grow flex-col gap-0.5">
                      <span className="text-[15px] font-medium">{t.shipping[m.id][0]}</span>
                      <span className="text-[13px] text-muted">{t.shipping[m.id][1]}</span>
                    </span>
                    <span className="text-[15px]">{hkd(m.cost)}</span>
                  </label>
                ))}
              </fieldset>
            </section>

            <div className="flex flex-col gap-3.5">
              {error && <p role="alert" className="text-sm text-accent">{error}</p>}
              <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg px-5 pb-5 pt-3 md:static md:border-0 md:p-0">
                <button type="submit" disabled={submitting} className="btn btn-primary h-14 w-full text-base md:h-[58px] md:text-[15px]">
                  <LockIcon />
                  {submitting ? c.redirecting : <><span className="md:hidden">{c.pay(hkd(total))}</span><span className="hidden md:inline">{c.continue}</span></>}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-muted md:text-center">{c.stripeNote}</p>
            </div>
          </form>

          <aside aria-label={c.summary} className="hidden flex-col gap-6 border-l border-line bg-panel px-8 pb-24 pt-[104px] md:flex xl:px-14">
            <h2 className="text-[15px] font-medium">{c.summary}</h2>
            <Summary t={t} lines={lines} subtotal={subtotal} shipLabel={currentLabel} shipCost={current.cost} />
            <div className="flex items-baseline justify-between border-t border-[#d9d0c3] pt-5">
              <span className="text-base font-medium">{c.total}</span>
              <span className="text-[22px]"><span className="text-[13px] text-muted">HKD </span>{hkd(total)}</span>
            </div>
            <span className="text-[13px] text-muted">{c.hkd}</span>
          </aside>
        </main>
      )}
    </div>
  );
}
