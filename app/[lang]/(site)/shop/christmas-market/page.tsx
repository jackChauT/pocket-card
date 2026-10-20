import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import ProductView from './ProductView';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.meta.product, description: t.meta.productDescription };
}

export default function ProductPage() {
  return <ProductView />;
}
