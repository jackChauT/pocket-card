import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { Address } from '@/lib/checkout';
import { getT } from '@/lib/i18n-server';
import { currentUser, db } from '@/lib/server';
import CheckoutForm, { type Saved } from './CheckoutForm';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.checkout, robots: { index: false } };
}

export default async function CheckoutPage() {
  await connection(); // per-request: depends on who is signed in
  const user = await currentUser();
  const saved: Saved = {};
  if (user?.email) {
    saved.email = user.email;
    // "Saved address" = the address from their most recent paid order.
    const { data } = await db()
      .from('orders')
      .select('country, shipping_address')
      .eq('email', user.email.toLowerCase())
      .neq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) Object.assign(saved, { country: data.country, address: data.shipping_address as Address });
  }
  return <CheckoutForm saved={saved} />;
}
