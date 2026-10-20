import Link from 'next/link';
import { product, STUDIO_NAME } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';

export default async function Footer() {
  const { t, href } = await getT();
  const f = t.footer;
  // Placeholder links ("#") are listed in HANDOFF §8.
  const groups = [
    { title: f.groups.shop, links: [[f.shopCard, href('/shop')], [f.card, href(`/shop/${product.slug}`)]] },
    { title: f.groups.help, links: [[f.faq, '#'], [f.shippingReturns, '#'], [f.contact, '#']] },
    { title: f.groups.studio, links: [[f.about, href('/#story')], ['Instagram', '#'], ['Pinterest', '#'], [f.etsy, '#']] },
  ];

  return (
    <footer className="mx-auto flex w-full max-w-[1440px] flex-col gap-9 border-t border-line px-5 pb-8 pt-12 md:gap-20 md:px-14 md:pb-10 md:pt-[88px]">
      <div className="grid gap-9 md:grid-cols-[5fr_7fr] md:gap-20">
        {/* placeholder: newsletter form has no provider yet; wire it to your email tool. */}
        <form className="flex max-w-[460px] flex-col gap-3 md:gap-4">
          <h2 className="display text-[28px] leading-[1.1] md:text-4xl">{f.title}</h2>
          <p className="text-sm leading-relaxed text-muted md:text-[15px]">{f.body}</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:gap-0 md:border-b md:border-ink">
            <label htmlFor="footer-email" className="sr-only">{f.emailLabel}</label>
            <input id="footer-email" type="email" required autoComplete="email" placeholder={f.emailPlaceholder}
              className="field md:h-12 md:grow md:border-0 md:bg-transparent md:px-0" />
            <button type="submit" className="btn btn-primary md:h-12 md:bg-transparent md:pl-4 md:pr-0 md:text-ink md:hover:bg-transparent md:hover:text-accent">{f.subscribe}</button>
          </div>
        </form>
        <div className="grid grid-cols-2 gap-8 text-[15px] md:grid-cols-3">
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title} className="flex flex-col md:gap-3.5">
              <div className="mb-1 text-[13px] uppercase tracking-[0.08em] text-muted">{g.title}</div>
              {g.links.map(([label, to]) => (
                <Link key={label} href={to} className="link flex min-h-11 items-center md:min-h-0">{label}</Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-line pt-5 text-xs text-muted md:flex-row md:items-center md:justify-between md:pt-6 md:text-[13px]">
        <span>{f.copyright(new Date().getFullYear())}</span>
        <div className="flex gap-6">
          {f.legal.map((l) => <a key={l} href="#" className="link text-muted">{l}</a>)}
        </div>
      </div>
    </footer>
  );
}
