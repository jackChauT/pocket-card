import type { Metadata } from 'next';
import Link from 'next/link';
import { CardImage } from '@/components/ui';
import { hkd, product } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.shop };
}

export default async function Shop() {
  const { t, href } = await getT();
  return (
    <div className="flex flex-col gap-10 px-5 pb-20 pt-12 md:gap-14 md:px-14 md:pb-[140px] md:pt-24">
      <div className="flex flex-col gap-4 border-b border-line pb-8">
        <h1 className="display text-[46px] tracking-[-0.02em] md:text-7xl">{t.shop.h1}</h1>
        <p className="text-base leading-relaxed text-soft md:text-[17px]">{t.shop.lead}</p>
      </div>
      <Link href={href(`/shop/${product.slug}`)} className="tile group grid items-end gap-6 text-ink no-underline md:grid-cols-[7fr_5fr] md:gap-20">
        <div className="flex h-[440px] items-center justify-center overflow-hidden bg-tile md:h-[780px]">
          <CardImage alt={t.product.alt.ready} sizes="(min-width: 768px) 450px, 260px" priority className="tile-art w-[260px] md:w-[450px]" />
        </div>
        <div className="flex flex-col gap-3.5 pb-2">
          <span className="font-serif text-[38px] leading-none group-hover:underline group-hover:underline-offset-4 md:text-[44px]">{t.product.name}</span>
          <span className="text-[17px] text-text-2">{t.product.from(hkd(product.basePriceHKD))}</span>
          <span className="flex items-center gap-2 text-sm text-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 20 L8 19 L19 8 L16 5 L5 16 Z" /><path d="M14 7 L17 10" /></svg>
            {t.shop.tagline}
          </span>
          <span className="mt-4 text-[15px] font-medium">{t.product.view} <span className="arrow">→</span></span>
        </div>
      </Link>
    </div>
  );
}
