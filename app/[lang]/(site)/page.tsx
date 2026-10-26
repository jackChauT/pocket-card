import Link from 'next/link';
import { InkCircle, InkRule, Lens, Stamp, StepDoodle, Tape } from '@/components/Ink';
import { CardImage } from '@/components/ui';
import { hkd, product } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';

// Details to magnify in "Look closer": source-pixel centres in the card artwork.
const LENSES = [
  { x: 714, y: 332 }, // the couple on the bench by the fountain
  { x: 503, y: 268 }, // star and bow on the tree
  { x: 430, y: 1192 }, // gifts under the tree
];

export default async function Home() {
  const { t, href } = await getT();
  const h = t.home;
  const productUrl = href(`/shop/${product.slug}`);

  return (
    <>
      <section aria-label={h.introLabel} className="grid md:h-[780px] md:grid-cols-[5fr_7fr]">
        <div className="order-2 flex flex-col justify-center gap-[18px] px-5 pb-11 pt-9 md:order-1 md:gap-7 md:pb-10 md:pl-14 md:pr-16 md:pt-0">
          <div className="eyebrow">{h.eyebrow}</div>
          <h1 className="hero-title display text-[46px] tracking-[-0.02em] text-balance md:text-[clamp(60px,6.1vw,88px)] md:leading-[0.98]">
            {h.h1[0]}<InkCircle>{h.h1[1]}</InkCircle>{h.h1[2]}
          </h1>
          <p className="max-w-[430px] text-base leading-relaxed text-soft text-pretty md:text-[19px]">{h.lead}</p>
          <div className="mt-2 flex md:mt-3">
            <Link href={href('/shop')} className="btn btn-primary h-[54px] w-full text-base md:w-auto md:px-[34px] md:text-[15px]">{h.cta}</Link>
          </div>
        </div>

        <div className="grain relative order-1 aspect-[390/440] overflow-hidden bg-tile-deep md:order-2 md:aspect-auto">
          {/* kraft envelope with stamp, card resting on top */}
          <div className="art absolute left-[9%] top-[52%] aspect-[46/32] w-[64%] -rotate-[8deg] bg-kraft md:left-[18%] md:top-[42%] md:w-[55%]">
            <svg viewBox="0 0 460 320" className="block size-full" aria-hidden><path d="M0 0 L230 170 L460 0" fill="none" stroke="#B8966C" strokeWidth="1.5" /></svg>
            <Stamp className="absolute bottom-[3%] left-[2%] w-[33%]" />
          </div>
          <CardImage alt={t.product.alt.hero} priority sizes="(min-width: 768px) 32vw, 64vw" className="absolute left-[26%] top-[8%] w-[64%] rotate-3 md:left-[36%] md:top-[9%] md:w-[52%] md:max-w-[440px]" />
          {/* margin note with a pencil arrow pointing at the card */}
          <div aria-hidden className="absolute left-[5%] top-[7%] hidden max-w-[30%] flex-col items-start text-text-2 md:flex">
            <span className="hand -rotate-6 text-[22px] lg:text-2xl">{h.heroNote}</span>
            <svg viewBox="0 0 80 60" className="ml-[40%] mt-1 h-14 w-20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M6 4 C10 30 34 48 70 50" /><path d="M60 42 L71 50 L60 57" />
            </svg>
          </div>
        </div>
      </section>

      <section aria-label={h.howItWorks} className="px-5 md:px-14">
        <InkRule />
        <div className="grid gap-6 py-8 md:grid-cols-3 md:gap-12 md:py-11">
          {h.steps.map(([title, body], i) => (
            <div key={title} className="flex items-start gap-4 md:gap-5">
              <StepDoodle step={i} className="shrink-0" />
              <div className="flex flex-col gap-0.5 md:gap-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif text-lg text-accent">0{i + 1}</span>
                  <span className="text-[15px] font-medium md:text-base">{title}</span>
                </div>
                <div className="text-sm leading-normal text-muted md:text-[15px]">{body}</div>
              </div>
            </div>
          ))}
        </div>
        <InkRule />
      </section>

      {/* Look closer: magnified details of the artwork */}
      <section aria-labelledby="closer-title" className="flex flex-col items-center gap-12 px-5 pb-6 pt-20 md:gap-16 md:px-14 md:pt-28">
        <div className="flex max-w-[620px] flex-col items-center gap-4 text-center">
          <div className="eyebrow">{h.closerEyebrow}</div>
          <h2 id="closer-title" className="display text-[38px] leading-[1.05] text-balance md:text-[52px]">{h.closerTitle}</h2>
          <p className="text-base leading-relaxed text-text-2 md:text-[17px]">{h.closerLead}</p>
        </div>
        <div className="grid w-full max-w-[1100px] gap-12 sm:grid-cols-3 sm:gap-6">
          {LENSES.map((l, i) => (
            <div key={i} className={i === 1 ? 'sm:translate-y-10' : ''}>
              <Lens x={l.x} y={l.y} caption={h.closer[i]} variant={i} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-title" className="grid items-center gap-5 px-5 py-16 md:grid-cols-[7fr_5fr] md:gap-24 md:px-14 md:pb-[120px] md:pt-32">
        <div className="eyebrow md:hidden">{h.featuredEyebrow}</div>
        <Link href={productUrl} aria-label={t.product.viewAria} className="tile grain flex h-[440px] items-center justify-center overflow-hidden bg-tile md:h-[760px]">
          <span className="tile-art relative block">
            <CardImage sizes="(min-width: 768px) 440px, 260px" className="w-[260px] md:w-[440px]" />
            <Tape className="-left-7 top-3 -rotate-[38deg]" />
            <Tape className="-right-7 bottom-4 -rotate-[38deg]" />
          </span>
        </Link>
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="eyebrow hidden md:block">{h.featuredEyebrow}</div>
          <h2 id="featured-title" className="display mt-2 text-[38px] md:mt-0 md:text-6xl">{t.product.name}</h2>
          <div className="text-base md:text-lg">{t.product.from(hkd(product.basePriceHKD))}</div>
          <p className="text-[15px] leading-relaxed text-text-2 text-pretty md:text-[17px] md:leading-[1.65]">{t.product.description}</p>
          <dl className="text-[15px]">
            <InkRule />
            {h.variants.map(([dt, dd]) => (
              <div key={dt}>
                <div className="grid grid-cols-[120px_1fr] gap-4 py-4 md:grid-cols-[140px_1fr]">
                  <dt className="font-medium">{dt}</dt>
                  <dd className="text-text-2">{dd}</dd>
                </div>
                <InkRule />
              </div>
            ))}
          </dl>
          <Link href={productUrl} className="link flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium">{t.product.view} <span className="arrow">→</span></Link>
        </div>
      </section>

      <section id="story" aria-labelledby="story-title" className="grid scroll-mt-4 items-center gap-10 px-5 pb-[72px] pt-8 md:grid-cols-[6fr_5fr] md:gap-24 md:pb-[140px] md:pl-[152px] md:pr-14 md:pt-20">
        <div className="flex max-w-[560px] flex-col gap-5 md:gap-7">
          <div className="eyebrow">{h.storyEyebrow}</div>
          <h2 id="story-title" className="display text-[38px] leading-[1.05] text-balance md:text-[56px] md:leading-[1.02]">{h.storyTitle}</h2>
          {h.story.map((p) => <p key={p} className="text-base leading-[1.7] text-text-2 text-pretty md:text-lg">{p}</p>)}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <span className="hand -rotate-2 text-[26px] text-ink">{h.signature}</span>
            {/* placeholder: no About page yet */}
            <a href="#" className="link flex min-h-11 items-center gap-1.5 text-[15px] font-medium">{h.ourStory} <span className="arrow">→</span></a>
          </div>
        </div>
        {/* placeholder: studio photograph, pinned like a print on the studio wall */}
        <div className="relative order-first mx-auto w-full max-w-[420px] rotate-2 bg-[#fbf8f2] p-3 pb-14 shadow-[0_1px_1px_rgba(33,30,26,0.06),0_16px_34px_-14px_rgba(33,30,26,0.28)] md:order-none md:p-4 md:pb-16">
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <div className="grain flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-photo px-6 text-center text-sm text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden><rect x="3" y="6" width="18" height="13" rx="1" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 6 L9.5 4 H14.5 L16 6" /></svg>
            <span>{h.photo}</span>
          </div>
          <span aria-hidden className="hand absolute bottom-4 left-0 right-0 text-center text-xl text-text-2 md:bottom-5">{h.storyEyebrow} · HK</span>
        </div>
      </section>
    </>
  );
}
