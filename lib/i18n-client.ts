'use client';
// Current language in Client Components, from the URL.
import { useParams } from 'next/navigation';
import { DICTS } from './dict';
import { DEFAULT_LANG, isLang } from './i18n';

export function useT() {
  const { lang: raw } = useParams<{ lang: string }>();
  const lang = isLang(raw) ? raw : DEFAULT_LANG;
  return { lang, t: DICTS[lang], href: (path: string) => `/${lang}${path}` };
}
