'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LOCALE_TAG, switchPath } from '@/lib/i18n';
import { useT } from '@/lib/i18n-client';

type Props = { className?: string };

/** Link to the same page in the other language; keeps the query string (e.g. ?session_id=). */
export default function LanguageSwitch(props: Props) {
  return (
    <Suspense fallback={<SwitchLink {...props} query="" />}>
      <WithQuery {...props} />
    </Suspense>
  );
}

function WithQuery(props: Props) {
  return <SwitchLink {...props} query={useSearchParams().toString()} />;
}

function SwitchLink({ className = '', query }: Props & { query: string }) {
  const { lang, t } = useT();
  const pathname = usePathname();
  const to = lang === 'en' ? 'zh-hk' : 'en';
  return (
    <Link
      href={`${switchPath(pathname, to)}${query ? `?${query}` : ''}`}
      hrefLang={LOCALE_TAG[to]}
      lang={LOCALE_TAG[to]}
      aria-label={t.switchLabel}
      className={`link flex min-h-11 items-center text-[15px] ${className}`}
      scroll={false}
    >
      {t.switchTo}
    </Link>
  );
}
