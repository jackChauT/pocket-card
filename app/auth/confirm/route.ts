// Magic-link landing. Handles both the default PKCE link (?code=) and the
// cross-device template link (?token_hash=&type=email), see README.
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LANG, isLang, LANG_COOKIE } from '@/lib/i18n';
import { supabaseAuth } from '@/lib/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const saved = req.cookies.get(LANG_COOKIE)?.value;
  const home = `/${isLang(saved) ? saved : DEFAULT_LANG}/account`;
  const next = url.searchParams.get('next') ?? home;
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : home;
  const supabase = await supabaseAuth();

  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: (url.searchParams.get('type') ?? 'email') as EmailOtpType })
      : { error: new Error('missing token') };

  return NextResponse.redirect(new URL(error ? `${home}?error=link` : safeNext, url.origin));
}
