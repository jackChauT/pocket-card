'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PREVIEW, STUDIO_NAME } from '@/lib/catalog';
import { useCart } from '@/lib/cart';
import { useT } from '@/lib/i18n-client';
import LanguageSwitch from './LanguageSwitch';
import { BagIcon } from './ui';

export default function Header() {
  const pathname = usePathname();
  const { t, href } = useT();
  const count = useCart().reduce((n, l) => n + l.quantity, 0);
  const nav = [
    { href: href('/shop'), label: t.nav.shop },
    { href: href('/#story'), label: t.nav.about },
  ];

  return (
    <header className="relative grid h-14 grid-cols-[44px_1fr_44px] items-center border-b border-line bg-bg px-1.5 md:flex md:h-[72px] md:justify-between md:px-14">
      {/* Mobile menu: native disclosure, re-mounted on navigation so it closes. */}
      <details key={pathname} className="md:hidden">
        <summary aria-label={t.nav.menu} className="flex size-11 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden><path d="M4 8 H20" /><path d="M4 16 H20" /></svg>
        </summary>
        <nav aria-label={t.nav.main} className="absolute inset-x-0 top-full z-20 flex flex-col border-b border-line bg-bg px-5 py-2">
          {[...nav, ...(PREVIEW ? [] : [{ href: href('/account'), label: t.nav.account }])].map((n) => (
            <Link key={n.href} href={n.href} className="link flex min-h-12 items-center text-base">{n.label}</Link>
          ))}
          <LanguageSwitch className="min-h-12 text-base" />
        </nav>
      </details>

      <div className="flex items-center justify-center gap-16">
        <Link href={href('/')} className="display text-2xl text-ink no-underline md:text-[28px]">{STUDIO_NAME}</Link>
        <nav aria-label={t.nav.main} className="hidden gap-9 text-[15px] md:flex">
          {nav.map((n) => <Link key={n.href} href={n.href} className="link">{n.label}</Link>)}
        </nav>
      </div>

      <div className="flex items-center md:gap-6">
        <LanguageSwitch className="hidden md:flex" />
        {!PREVIEW && <Link href={href('/account')} className="link hidden text-[15px] md:inline">{t.nav.account}</Link>}
        <Link href={href('/cart')} aria-label={t.nav.cartAria(count)} className="link relative flex size-11 items-center justify-center text-[15px] md:w-auto md:gap-2 md:pl-2 md:pr-1">
          <BagIcon />
          <span className="hidden md:inline" aria-hidden>{t.nav.cart(count)}</span>
          {count > 0 && (
            <span aria-hidden className="absolute right-1.5 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-bg md:hidden">{count}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
