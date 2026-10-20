import type { Metadata } from 'next';
import Link from 'next/link';
import { hkd } from '@/lib/catalog';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import type { Order } from '@/lib/orders';
import { currentUser, db, isAdmin } from '@/lib/server';
import { signIn, signOut } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.account, robots: { index: false } };
}

export default async function Account({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; next?: string }> }) {
  const { lang, t, href } = await getT();
  const a = t.account;
  const { sent, error, next } = await searchParams;
  const user = await currentUser();

  if (!user?.email) {
    return (
      <div className="mx-auto flex max-w-[460px] flex-col gap-6 px-5 pb-24 pt-14 md:pt-28">
        <h1 className="display text-[46px] md:text-6xl">{a.h1}</h1>
        {sent ? (
          <p role="status" className="bg-panel p-6 text-base leading-relaxed text-text-2">{a.sent}</p>
        ) : (
          <>
            <p className="text-base leading-relaxed text-text-2">{a.intro}</p>
            <form action={signIn} className="flex flex-col gap-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="next" value={next ?? href('/account')} />
              <label htmlFor="email" className="label">{a.email}</label>
              <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className="field" />
              {error && a.errors[error] && <p role="alert" className="text-sm text-accent">{a.errors[error]}</p>}
              <button className="btn btn-primary mt-2">{a.sendLink}</button>
            </form>
            <p className="text-[13px] leading-relaxed text-muted">{a.guestNote}</p>
          </>
        )}
      </div>
    );
  }

  const { data } = await db()
    .from('orders')
    .select('id, number, status, lines, total_hkd, created_at')
    .eq('email', user.email.toLowerCase())
    .neq('status', 'pending_payment')
    .order('created_at', { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="flex flex-col gap-8 px-5 pb-20 pt-12 md:gap-12 md:px-14 md:pb-[140px] md:pt-[88px] xl:px-[152px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="display text-[46px] md:text-6xl">{a.h1}</h1>
        <div className="flex flex-wrap items-center gap-x-5 text-sm text-muted">
          <span className="[overflow-wrap:anywhere]">{a.signedInAs(user.email)}</span>
          {isAdmin(user.email) && <Link href={href('/admin')} className="link flex min-h-11 items-center underline">{a.admin}</Link>}
          <form action={signOut}>
            <input type="hidden" name="lang" value={lang} />
            <button className="link min-h-11 text-text-2 underline">{a.signOut}</button>
          </form>
        </div>
      </div>

      <section aria-labelledby="orders-title" className="flex flex-col gap-4">
        <h2 id="orders-title" className="display text-3xl">{a.orders}</h2>
        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-5 border-t border-line pt-8">
            <p className="text-[17px] text-text-2">{a.none}</p>
            <Link href={href('/shop')} className="btn btn-primary">{a.shop}</Link>
          </div>
        ) : (
          <ul className="flex flex-col border-t border-line">
            {orders.map((o) => {
              const cards = o.lines.reduce((n, l) => n + l.quantity, 0);
              const action = o.status === 'proof_sent';
              return (
                <li key={o.id}>
                  <Link href={href(`/account/orders/${o.id}`)} className="tile grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-line py-5 text-ink no-underline md:grid-cols-[120px_1fr_200px_100px_auto]">
                    <span className="font-medium">#{o.number}</span>
                    <span className="text-right text-sm text-muted md:text-left">{formatDate(o.created_at, lang)} · {a.cards(cards)}</span>
                    <span className={`text-sm ${action ? 'font-medium text-accent' : 'text-text-2'}`}>{t.status[o.status]}</span>
                    <span className="text-right text-sm md:text-left">{hkd(o.total_hkd)}</span>
                    <span className="hidden text-sm font-medium md:inline">{action ? a.review : a.view} <span className="arrow">→</span></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <p className="text-sm text-muted">{a.savedNote}</p>
    </div>
  );
}
