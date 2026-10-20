'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CardImage, ChatIcon, Stepper, UploadIcon } from '@/components/ui';
import { addLine } from '@/lib/cart';
import { hkd, NOTES_MAX, product, unitPrice, WHATSAPP_DISPLAY, whatsappLink, type CartLine, type Variant } from '@/lib/catalog';
import { serverError } from '@/lib/dict';
import { useT } from '@/lib/i18n-client';

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

type Photo =
  | { status: 'idle' }
  | { status: 'uploading'; name: string }
  | { status: 'done'; name: string; key: string }
  | { status: 'error'; message: string };

export default function ProductView() {
  const router = useRouter();
  const { t, href } = useT();
  const p = t.pdp;
  const [variant, setVariant] = useState<Variant>('ready');
  const [share, setShare] = useState<'upload' | 'whatsapp'>('upload');
  const [photo, setPhoto] = useState<Photo>({ status: 'idle' });
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const personal = variant === 'personalised';
  const total = unitPrice(variant) * qty;
  const waUrl = whatsappLink(p.waMessage);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (file.size > MAX_PHOTO_BYTES) return setPhoto({ status: 'error', message: p.tooBig });
    setPhoto({ status: 'uploading', name: file.name });
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: file.name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(serverError(t, data.error));
      const put = await fetch(data.url, { method: 'PUT', headers: { 'content-type': file.type || 'application/octet-stream' }, body: file });
      if (!put.ok) throw new Error(p.uploadFailed);
      setPhoto({ status: 'done', name: file.name, key: data.key });
    } catch (err) {
      setPhoto({ status: 'error', message: (err as Error).message || p.uploadFailed });
    }
  }

  function addToCart() {
    let personalisation: CartLine['personalisation'];
    if (personal && share === 'upload') {
      if (photo.status === 'uploading') return setError(p.stillUploading);
      if (photo.status !== 'done') return setError(p.needPhoto);
      personalisation = { method: 'upload', photoKey: photo.key, photoName: photo.name, notes: notes.trim() || undefined };
    } else if (personal) personalisation = { method: 'whatsapp' };
    addLine({ id: crypto.randomUUID(), productSlug: product.slug, variant, quantity: qty, personalisation });
    router.push(href('/cart'));
  }

  const uploadTitle = photo.status === 'done' ? p.uploaded(photo.name) : photo.status === 'uploading' ? p.uploading(photo.name) : p.uploadIdle;
  const uploadHint = photo.status === 'done' ? p.hintDone : photo.status === 'error' ? photo.message : p.hintIdle;

  return (
    <div className="flex flex-col gap-7 pb-28 md:px-14 md:pb-[140px] md:pt-7">
      <nav aria-label={p.breadcrumb} className="hidden gap-2.5 text-[13px] text-muted md:flex">
        <Link href={href('/shop')} className="link text-muted">{t.nav.shop}</Link><span aria-hidden>/</span>
        <span className="text-ink" aria-current="page">{t.product.name}</span>
      </nav>

      <div className="grid items-start gap-6 md:grid-cols-[7fr_5fr] md:gap-20">
        {/* Image: cross-fades between ready-made and circled version */}
        <div className="md:sticky md:top-6">
          <div className="relative aspect-[390/440] overflow-hidden bg-tile md:aspect-square">
            {(['ready', 'personalised'] as const).map((v) => (
              <div key={v} aria-hidden={v !== variant} className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[450ms] ${v === variant ? 'opacity-100' : 'opacity-0'}`}>
                <CardImage variant={v} priority={v === 'ready'} sizes="(min-width: 768px) 40vw, 70vw" alt={t.product.alt[v]} className="h-[88%] w-auto md:h-[86%]" />
              </div>
            ))}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-bg/90 px-2.5 py-1 text-xs text-text-2 md:bottom-4 md:left-5 md:px-3 md:py-1.5 md:text-[13px]" aria-live="polite">
              {personal && <span className="ring-mark" />}
              <span>{personal ? p.captionPersonal : p.captionReady}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-5 md:gap-8 md:px-0 md:pt-2">
          <div className="flex flex-col gap-2 md:gap-3.5">
            <div className="eyebrow">{t.product.eyebrow}</div>
            <h1 className="display text-[38px] md:text-[56px]">{t.product.name}</h1>
            <div className="text-lg md:text-xl">{hkd(unitPrice(variant))}{personal && p.personalisedSuffix}</div>
            <p className="text-[15px] leading-relaxed text-text-2 text-pretty md:text-base md:leading-[1.65]">{t.product.description}{t.product.blankInside}</p>
          </div>

          {/* placeholder: card specs */}
          <dl className="grid grid-cols-[120px_1fr] gap-y-2.5 border-y border-line py-5 text-sm">
            {p.specs.map(([dt, dd]) => <div key={dt} className="contents"><dt className="text-muted">{dt}</dt><dd>{dd}</dd></div>)}
          </dl>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-medium">{p.choose}</legend>
            {(['ready', 'personalised'] as const).map((v) => (
              <label key={v} className="opt">
                <input type="radio" name="variant" checked={variant === v} onChange={() => { setVariant(v); setError(''); }} />
                <span className="flex grow flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{t.variant[v]}</span>
                  <span className="text-[13px] text-muted">{t.variantNote[v]}</span>
                </span>
                <span className="text-[15px]">{v === 'ready' ? hkd(product.basePriceHKD) : `+${hkd(product.personalisationFeeHKD)}`}</span>
              </label>
            ))}
          </fieldset>

          {personal && (
            <div className="reveal flex flex-col gap-7 bg-panel px-4 py-5 md:p-7">
              <div className="flex flex-col gap-3">
                <h2 className="font-serif text-2xl leading-[1.1] md:text-[28px]">{p.panelTitle}</h2>
                <p className="text-sm leading-[1.65] text-text-2">{p.panelBody}</p>
                <ul className="mt-1 flex flex-col gap-2 text-sm">
                  {t.product.areas.map((a) => <li key={a} className="flex items-center gap-2.5"><span className="ring-mark" />{a}</li>)}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <span id="share-label" className="text-[15px] font-medium">{p.shareLabel}</span>
                <div role="group" aria-labelledby="share-label" className="grid grid-cols-2 gap-0.5 rounded-full border border-line-input bg-bg p-1">
                  {(['upload', 'whatsapp'] as const).map((s) => (
                    <button key={s} type="button" aria-pressed={share === s} onClick={() => { setShare(s); setError(''); }}
                      className={`h-11 rounded-full text-sm transition-colors ${share === s ? 'bg-ink text-bg' : 'text-text-2'}`}>
                      {s === 'upload' ? p.upload : p.whatsapp}
                    </button>
                  ))}
                </div>
              </div>

              {share === 'upload' ? (
                <div className="flex flex-col gap-4">
                  <label className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[2px] border border-dashed border-[#a39a8e] bg-bg p-6 text-center transition-colors hover:border-ink hover:bg-surface focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-accent md:min-h-40">
                    <input type="file" accept="image/*,.heic,.heif" onChange={onFile} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                    <UploadIcon className="text-text-2" />
                    <span className="text-[15px] font-medium [overflow-wrap:anywhere]">{uploadTitle}</span>
                    <span className={`text-[13px] ${photo.status === 'error' ? 'text-accent' : 'text-muted'}`} role={photo.status === 'error' ? 'alert' : undefined}>{uploadHint}</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <label htmlFor="notes" className="font-medium">{p.notesLabel} <span className="font-normal text-muted">{p.optional}</span></label>
                      <span className="text-muted">{notes.length} / {NOTES_MAX}</span>
                    </div>
                    <textarea id="notes" rows={3} maxLength={NOTES_MAX} value={notes} onChange={(e) => setNotes(e.target.value)} className="field" placeholder={p.notesPlaceholder} />
                  </div>
                  <a href={waUrl} target="_blank" rel="noopener" className="link flex min-h-11 items-center self-start text-sm text-text-2 underline">{p.talk}</a>
                </div>
              ) : (
                <div className="reveal flex flex-col gap-4">
                  <p className="text-sm leading-[1.65] text-text-2">{p.waBody}</p>
                  <a href={waUrl} target="_blank" rel="noopener" className="btn btn-secondary"><ChatIcon />{p.waButton}</a>
                  <span className="text-center text-[13px] text-muted">{WHATSAPP_DISPLAY}</span>
                </div>
              )}

              <p className="text-[13px] leading-normal text-text-2">{p.tip}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium md:hidden">{p.quantity}</span>
              <Stepper value={qty} onChange={setQty} size="lg" labels={{ group: p.quantity, decrease: p.decrease, increase: p.increase }} />
              {/* Mobile: sticky bottom bar. Desktop: inline beside the stepper. */}
              <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-3.5 border-t border-line bg-bg px-5 pb-5 pt-3 md:static md:grow md:border-0 md:p-0">
                <div className="flex flex-col md:hidden">
                  <span className="text-xs text-muted">{t.variant[variant]} · {t.checkout.qty(qty)}</span>
                  <span className="text-[17px] font-medium">{hkd(total)}</span>
                </div>
                <button type="button" onClick={addToCart} disabled={photo.status === 'uploading' && personal && share === 'upload'} className="btn btn-primary h-[54px] grow text-base md:h-14 md:gap-3 md:text-[15px]">
                  {p.addToCart} <span className="hidden md:inline"><span className="opacity-60">·</span> {hkd(total)}</span>
                </button>
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-accent">{error}</p>}
          </div>

          <ul className="-mt-3 flex flex-wrap justify-between gap-3 text-[13px] text-text-2">
            {p.reassure.map((r) => <li key={r}>{r}</li>)}
          </ul>

          <div className="flex flex-col border-t border-line">
            {p.accordions.map(([title, body]) => (
              <details key={title} className="border-b border-line">
                <summary className="flex h-14 items-center justify-between text-[15px] font-medium hover:text-accent md:h-[60px]">
                  {title}<span className="plus text-xl font-light" aria-hidden>+</span>
                </summary>
                <div className="pb-5 text-sm leading-[1.65] text-text-2">{body}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
