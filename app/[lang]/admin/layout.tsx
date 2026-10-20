import type { Metadata } from 'next';
import Link from 'next/link';
import { STUDIO_NAME } from '@/lib/catalog';
import { getT } from '@/lib/i18n-server';
import { requireAdmin } from '@/lib/server';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const { href } = await getT();
  return (
    <div className="min-h-dvh">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-line px-5 md:h-16 md:px-10">
        <div className="flex items-center gap-8">
          <Link href={href('/admin')} className="display text-2xl text-ink">{STUDIO_NAME} <span className="font-sans text-sm text-muted">Admin</span></Link>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden text-muted md:inline">{user.email}</span>
          <Link href={href('/')} className="link">View site</Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}
