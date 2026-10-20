// Server-only helpers. Clients are created lazily so the site builds without env vars.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Order } from './orders';

export const PHOTO_BUCKET = 'photos';

export const siteUrl = () => process.env.SITE_URL ?? 'http://localhost:3077';

export const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Service-role client: bypasses RLS. Every caller must check who is asking first. */
export const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

/** Cookie-based client, used only for sign-in state. */
export async function supabaseAuth() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {} // called from a Server Component; proxy.ts refreshes the session instead
      },
    },
  });
}

export async function currentUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { data } = await (await supabaseAuth()).auth.getUser();
  return data.user;
}

export const isAdmin = (email?: string | null) =>
  !!email &&
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .includes(email.toLowerCase());

export const adminEmails = () => (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

/** 404 for everyone except studio staff (don't reveal that /admin exists). */
export async function requireAdmin() {
  const user = await currentUser();
  if (!isAdmin(user?.email)) notFound();
  return user!;
}

export async function getOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data } = await db().from('orders').select('*').eq('id', id).maybeSingle();
  return data as Order | null;
}

/** Short-lived link to a private file (customer photo or sketch). */
export async function signedUrl(key: string) {
  const { data } = await db().storage.from(PHOTO_BUCKET).createSignedUrl(key, 60 * 10);
  return data?.signedUrl ?? null;
}
