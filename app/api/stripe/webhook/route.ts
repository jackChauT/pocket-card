import type Stripe from 'stripe';
import { hkd, whatsappLink } from '@/lib/catalog';
import { DICTS } from '@/lib/dict';
import { button, esc, sendEmail } from '@/lib/email';
import { isPersonalised, needsWhatsAppPhoto, type Order } from '@/lib/orders';
import { db, siteUrl, stripe } from '@/lib/server';

const PAID_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

export async function POST(req: Request) {
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await req.text(),
      req.headers.get('stripe-signature') ?? '',
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (PAID_EVENTS.includes(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    const id = session.metadata?.order_id;
    if (id && session.payment_status === 'paid') {
      const { data: lookup, error } = await db().from('orders').select('lines').eq('id', id).single();
      if (error) return new Response('Order lookup failed', { status: 500 }); // Stripe retries
      const waiting = needsWhatsAppPhoto(lookup.lines);
      // Only the first delivery flips pending_payment → paid, so the email goes out once.
      const { data: order } = await db()
        .from('orders')
        .update({ status: waiting ? 'awaiting_photo' : 'received', paid_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'pending_payment')
        .select('*')
        .maybeSingle();
      if (order) await sendConfirmation(order as Order);
    }
  }
  return Response.json({ received: true });
}

function sendConfirmation(o: Order) {
  const lang = o.lang ?? 'en';
  const e = DICTS[lang].email;
  const number = `#${o.number}`;
  const whatsapp = needsWhatsAppPhoto(o.lines)
    ? `<p>${e.confirmWhatsApp(number)}</p>${button(whatsappLink(DICTS[lang].order.whatsappMessage(number)), DICTS[lang].pdp.waButton)}`
    : '';
  const sketch = isPersonalised(o.lines) ? `<p>${e.confirmSketch}</p>` : '';
  return sendEmail(
    o.email,
    e.confirmSubject(number),
    `<p>${esc(e.hello(o.shipping_address.firstName))}</p>
     <p>${esc(e.confirmBody(number, hkd(o.total_hkd)))}</p>
     ${whatsapp}${sketch}
     ${button(`${siteUrl()}/${lang}/account/orders/${o.id}`, e.track)}
     <p style="color:#6A6259;font-size:13px">${e.signInNote}</p>`,
    lang,
  );
}
