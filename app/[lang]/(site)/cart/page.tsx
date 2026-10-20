import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import CartView from './CartView';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.cart };
}

export default function CartPage() {
  return <CartView />;
}
