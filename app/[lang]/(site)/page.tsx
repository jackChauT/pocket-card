import Link from 'next/link';
import { CardImage } from '@/components/ui';
import { hkd, product } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';

export default async function Home() {
  const { t, href } = await getT();
  const h = t.home;
  const productUrl = href(`/shop/${product.slug}`);

  return (
    <>
      <section aria-label={h.introLabel} className="grid md:h-[780px] md:grid-cols-[5fr_7fr]">
        <div className="order-2 flex flex-col justify-center gap-[18px] px-5 pb-11 pt-9 md:order-1 md:gap-7 md:pb-10 md:pl-14 md:pr-16 md:pt-0">
          <div className="eyebrow">{h.eyebrow}</div>
          <h1 className="hero-title display text-[46px] tracking-[-0.02em] text-balance md:text-[clamp(60px,6.1vw,88px)] md:leading-[0.98]">{h.h1}</h1>
          <p className="max-w-[430px] text-base leading-relaxed text-soft text-pretty md:text-[19px]">{h.lead}</p>
          <div className="mt-2 flex md:mt-3">
            <Link href={href('/shop')} className="btn btn-primary h-[54px] w-full text-base md:w-auto md:px-[34px] md:text-[15px]">{h.cta}</Link>
          </div>
        </div>
        <div className="relative order-1 aspect-[390/440] overflow-hidden bg-tile-deep md:order-2 md:aspect-auto">
          <div className="art absolute left-[9%] top-[52%] aspect-[46/32] w-[64%] -rotate-[8deg] bg-kraft md:left-[18%] md:top-[42%] md:w-[55%]">
            <svg viewBox="0 0 460 320" className="block size-full" aria-hidden><path d="M0 0 L230 170 L460 0" fill="none" stroke="#B8966C" strokeWidth="1.5" /></svg>
          </div>
          <CardImage alt={t.product.alt.hero} priority sizes="(min-width: 768px) 32vw, 64vw" className="absolute left-[26%] top-[8%] w-[64%] rotate-3 md:left-[36%] md:top-[9%] md:w-[52%] md:max-w-[440px]" />
          <div className="absolute bottom-7 left-8 hidden text-[13px] text-muted md:block">{h.heroCaption}</div>
        </div>
      </section>

      <section aria-label={h.howItWorks} className="grid gap-5 border-y border-line px-5 py-7 md:grid-cols-3 md:gap-12 md:px-14 md:py-11">
        {h.steps.map(([title, body], i) => (
          <div key={title} className="flex items-baseline gap-4 md:gap-5">
            <span className="font-serif text-xl text-accent md:text-[22px]">0{i + 1}</span>
            <div className="flex flex-col gap-0.5 md:gap-1.5">
              <div className="text-[15px] font-medium md:text-base">{title}</div>
              <div className="text-sm leading-normal text-muted md:text-[15px]">{body}</div>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="featured-title" className="grid items-center gap-5 px-5 py-16 md:grid-cols-[7fr_5fr] md:gap-24 md:px-14 md:pb-[120px] md:pt-32">
        <div className="eyebrow md:hidden">{h.featuredEyebrow}</div>
        <Link href={productUrl} aria-label={t.product.viewAria} className="tile flex h-[440px] items-center justify-center overflow-hidden bg-tile md:h-[760px]">
          <CardImage sizes="(min-width: 768px) 440px, 260px" className="tile-art w-[260px] md:w-[440px]" />
        </Link>
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="eyebrow hidden md:block">{h.featuredEyebrow}</div>
          <h2 id="featured-title" className="display mt-2 text-[38px] md:mt-0 md:text-6xl">{t.product.name}</h2>
          <div className="text-base md:text-lg">{t.product.from(hkd(product.basePriceHKD))}</div>
          <p className="text-[15px] leading-relaxed text-text-2 text-pretty md:text-[17px] md:leading-[1.65]">{t.product.description}</p>
          <dl className="border-t border-line text-[15px]">
            {h.variants.map(([dt, dd]) => (
              <div key={dt} className="grid grid-cols-[120px_1fr] gap-4 border-b border-line py-4 md:grid-cols-[140px_1fr]">
                <dt className="font-medium">{dt}</dt>
                <dd className="text-text-2">{dd}</dd>
              </div>
            ))}
          </dl>
          <Link href={productUrl} className="link flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium">{t.product.view} <span className="arrow">→</span></Link>
        </div>
      </section>

      <section id="story" aria-labelledby="story-title" className="grid scroll-mt-4 items-center gap-5 px-5 pb-[72px] pt-8 md:grid-cols-[6fr_5fr] md:gap-24 md:pb-[140px] md:pl-[152px] md:pr-14 md:pt-20">
        <div className="flex max-w-[560px] flex-col gap-5 md:gap-7">
          <div className="eyebrow">{h.storyEyebrow}</div>
          <h2 id="story-title" className="display text-[38px] leading-[1.05] text-balance md:text-[56px] md:leading-[1.02]">{h.storyTitle}</h2>
          {h.story.map((p) => <p key={p} className="text-base leading-[1.7] text-text-2 text-pretty md:text-lg">{p}</p>)}
          <div className="mt-2 flex items-center justify-between gap-6">
            <span className="font-serif text-xl italic text-muted">{h.signature}</span>
            {/* placeholder: no About page yet */}
            <a href="#" className="link flex min-h-11 items-center gap-1.5 text-[15px] font-medium">{h.ourStory} <span className="arrow">→</span></a>
          </div>
        </div>
        {/* placeholder: studio photograph */}
        <div className="order-first flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-photo text-sm text-muted md:order-none md:aspect-[4/5]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden><rect x="3" y="6" width="18" height="13" rx="1" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 6 L9.5 4 H14.5 L16 6" /></svg>
          <span>{h.photo}</span>
        </div>
      </section>
    </>
  );
}
