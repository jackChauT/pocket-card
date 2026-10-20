// 1. Every page lives under /en or /zh-hk: bare paths redirect to the visitor's
//    saved choice (cookie) or their browser language.
// 2. Keeps the Supabase sign-in session fresh on pages that use it.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isLang, LANG_COOKIE, pickLang } from './lib/i18n';

const AUTH_PAGES = /^\/[^/]+\/(account|admin|checkout)(\/|$)/;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segment = pathname.split('/')[1];

  if (!isLang(segment)) {
    const saved = request.cookies.get(LANG_COOKIE)?.value;
    const lang = isLang(saved) ? saved : pickLang(request.headers.get('accept-language'));
    return NextResponse.redirect(new URL(`/${lang}${pathname === '/' ? '' : pathname}${search}`, request.url));
  }

  let response = NextResponse.next({ request });
  if (AUTH_PAGES.test(pathname) && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }
  // Remember the language the visitor is reading in (switcher or direct link).
  if (request.cookies.get(LANG_COOKIE)?.value !== segment) {
    response.cookies.set(LANG_COOKIE, segment, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return response;
}

// Pages only: skip API routes, the magic-link handler, Next internals and files like /christmas-card.jpg.
export const config = { matcher: ['/((?!api/|auth/|_next/|.*\\..*).*)'] };
