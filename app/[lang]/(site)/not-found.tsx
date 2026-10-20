import Link from 'next/link';
import { getT } from '@/lib/i18n-server';

export default async function NotFound() {
  const { t, href } = await getT();
  return (
    <div className="flex flex-col items-start gap-5 px-5 pb-24 pt-16 md:px-14 md:pt-28">
      <h1 className="display text-[46px] md:text-6xl">{t.notFound.h1}</h1>
      <p className="text-[17px] text-text-2">{t.notFound.body}</p>
      <Link href={href('/')} className="btn btn-primary">{t.notFound.home}</Link>
    </div>
  );
}
