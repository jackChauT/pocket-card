import type { Metadata } from 'next';
import { Figtree, Instrument_Serif, Kalam, LXGW_WenKai_TC, Noto_Serif_TC } from 'next/font/google';
import { LOCALE_TAG, LOCALES } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { siteUrl } from '@/lib/server';
import '../globals.css';

const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-instrument' });
const sans = Figtree({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-figtree' });
// Chinese headings. Served in unicode-range slices, so only the characters on the page download.
const serifTC = Noto_Serif_TC({ weight: '400', subsets: ['latin'], preload: false, variable: '--font-serif-tc' });
// Handwritten margin notes, like pencil annotations on the artwork (Latin + Traditional Chinese).
const hand = Kalam({ weight: '400', subsets: ['latin'], variable: '--font-kalam' });
const handTC = LXGW_WenKai_TC({ weight: '400', subsets: ['latin'], preload: false, variable: '--font-hand-tc' });

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: `%s · ${t.meta.title.split(' · ')[0]}` },
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_TAG[l], `/${l}`])) },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await getT();
  return (
    <html lang={LOCALE_TAG[lang]} className={`${serif.variable} ${sans.variable} ${serifTC.variable} ${hand.variable} ${handTC.variable}`}>
      <body>{children}</body>
    </html>
  );
}

export const dynamicParams = false; // only /en and /zh-hk exist
