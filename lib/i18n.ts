// Languages. Pure, so proxy, server, client and tests can all import it.

export const LOCALES = ['en', 'zh-hk'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'lang';

export const isLang = (v: unknown): v is Lang => LOCALES.includes(v as Lang);

/** BCP 47 tag for <html lang>, Intl and Stripe. */
export const LOCALE_TAG: Record<Lang, string> = { en: 'en', 'zh-hk': 'zh-Hant-HK' };

/** Best match from an Accept-Language header: any Chinese preference → zh-hk. */
export function pickLang(acceptLanguage: string | null | undefined): Lang {
  const prefs = (acceptLanguage ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q === undefined ? 1 : Number(q) || 0 };
    })
    .filter((p) => p.tag && p.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of prefs) {
    if (tag.startsWith('zh')) return 'zh-hk';
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LANG;
}

/** Swap (or add) the language prefix on a path: /en/shop → /zh-hk/shop. */
export function switchPath(pathname: string, to: Lang) {
  const parts = pathname.split('/');
  if (isLang(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join('/') || `/${to}`;
}

export const formatDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'zh-hk' ? 'zh-HK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
