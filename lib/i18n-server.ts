// Current language in Server Components, from the /[lang] root segment.
import { notFound } from 'next/navigation';
import { lang as rootLang } from 'next/root-params';
import { DICTS } from './dict';
import { isLang } from './i18n';

export async function getT() {
  const lang = await rootLang();
  if (!isLang(lang)) notFound();
  return { lang, t: DICTS[lang], href: (path: string) => `/${lang}${path}` };
}
