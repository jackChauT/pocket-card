'use server';
// Server Actions can't read the URL's language, so each form posts a hidden `lang`.
import { redirect } from 'next/navigation';
import { esc, sendEmail } from '@/lib/email';
import { DEFAULT_LANG, isLang, type Lang } from '@/lib/i18n';
import { adminEmails, currentUser, db, siteUrl, supabaseAuth } from '@/lib/server';

const langOf = (f: FormData): Lang => { const l = f.get('lang'); return isLang(l) ? l : DEFAULT_LANG; };
const safeNext = (v: unknown, lang: Lang) =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : `/${lang}/account`;

export async function signIn(formData: FormData) {
  const lang = langOf(formData);
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = safeNext(formData.get('next'), lang);
  const back = (q: string) => redirect(`/${lang}/account?${q}&next=${encodeURIComponent(next)}`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back('error=email');

  const { error } = await (await supabaseAuth()).auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  back(error ? 'error=send' : 'sent=1');
}

export async function signOut(formData: FormData) {
  await (await supabaseAuth()).auth.signOut();
  redirect(`/${langOf(formData)}`);
}

export async function reviewProof(formData: FormData) {
  const lang = langOf(formData);
  const user = await currentUser();
  const id = String(formData.get('id') ?? '');
  const page = `/${lang}/account/orders/${id}`;
  if (!user?.email) redirect(`/${lang}/account?next=${encodeURIComponent(page)}`);

  const approve = formData.get('decision') === 'approve';
  const feedback = String(formData.get('feedback') ?? '').trim().slice(0, 1000);
  if (!approve && !feedback) redirect(`${page}?error=feedback`);

  // Only the order's owner, and only while a sketch is waiting for review.
  const { data: order } = await db()
    .from('orders')
    .update(approve
      ? { status: 'approved', approved_at: new Date().toISOString() }
      : { status: 'changes_requested', proof_feedback: feedback })
    .eq('id', id)
    .eq('email', user.email.toLowerCase())
    .eq('status', 'proof_sent')
    .select('id, number')
    .maybeSingle();

  if (order) {
    const link = `<p><a href="${siteUrl()}/en/admin/orders/${order.id}">Open the order</a></p>`;
    await sendEmail(
      adminEmails(),
      approve ? `Order #${order.number}: sketch approved` : `Order #${order.number}: changes requested`,
      approve
        ? `<p>The customer approved the sketch for order #${order.number}. It can go to print.</p>${link}`
        : `<p>The customer asked for changes on order #${order.number}:</p><blockquote>${esc(feedback)}</blockquote>${link}`,
    );
  }
  redirect(page);
}
