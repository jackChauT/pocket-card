import Link from 'next/link';
import { countryName, hkd } from '@/lib/catalog';
import { isPersonalised, ORDER_STATUSES, ADMIN_STATUS_LABEL, type Order } from '@/lib/orders';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { db } from '@/lib/server';

// "To do" = orders waiting on the studio.
const TODO = ['received', 'changes_requested', 'approved', 'preparing', 'packed'];
const FILTERS = ['todo', ...ORDER_STATUSES.filter((s) => s !== 'pending_payment'), 'all'];
const filterLabel = (f: string) => (f === 'todo' ? 'To do' : f === 'all' ? 'All paid' : ADMIN_STATUS_LABEL[f as Order['status']]);

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'todo' } = await searchParams;
  const { href } = await getT();
  let query = db()
    .from('orders')
    .select('id, number, status, email, lines, country, total_hkd, created_at')
    .neq('status', 'pending_payment')
    .order('created_at', { ascending: status === 'todo' }) // oldest first when working through the queue
    .limit(200); // ponytail: no pagination; add it past a few hundred open orders
  if (status === 'todo') query = query.in('status', TODO);
  else if (status !== 'all') query = query.eq('status', status);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl">Orders</h1>
      <nav aria-label="Filter orders" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={`${href('/admin')}?status=${f}`} aria-current={f === status ? 'page' : undefined}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm no-underline transition-colors ${f === status ? 'border-ink bg-ink text-bg' : 'border-line-input text-text-2 hover:border-ink'}`}>
            {filterLabel(f)}
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <p className="border-t border-line pt-8 text-text-2">Nothing here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="text-[13px] text-muted">
              <tr className="border-b border-line">
                {['Order', 'Date', 'Customer', 'Items', 'Ship to', 'Total', 'Status'].map((h) => <th key={h} className="py-3 pr-4 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cards = o.lines.reduce((n, l) => n + l.quantity, 0);
                return (
                  <tr key={o.id} className="border-b border-line hover:bg-surface">
                    <td className="py-3 pr-4"><Link href={href(`/admin/orders/${o.id}`)} className="link flex min-h-11 items-center font-medium underline">#{o.number}</Link></td>
                    <td className="py-3 pr-4 text-text-2">{formatDate(o.created_at, 'en')}</td>
                    <td className="max-w-[220px] truncate py-3 pr-4">{o.email}</td>
                    <td className="py-3 pr-4">{cards} {isPersonalised(o.lines) && <span className="text-accent">· personalised</span>}</td>
                    <td className="py-3 pr-4 text-text-2">{countryName(o.country)}</td>
                    <td className="py-3 pr-4">{hkd(o.total_hkd)}</td>
                    <td className="py-3 pr-4">{ADMIN_STATUS_LABEL[o.status]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
