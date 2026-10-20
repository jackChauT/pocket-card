import { priceOrder, unitPrice } from '@/lib/catalog';
import { DICTS } from '@/lib/dict';
import { DEFAULT_LANG, isLang, type Lang } from '@/lib/i18n';
import { parseCheckout, type CheckoutInput } from '@/lib/checkout';
import { db, stripe } from '@/lib/server';

export async function POST(req: Request) {
  let input: CheckoutInput;
  let body: any;
  try {
    body = await req.json();
    input = parseCheckout(body);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }

  const { subtotal, ship, total } = priceOrder(input.lines, input.country, input.shippingMethod);
  const lines = input.lines.map((l) => ({ ...l, unitHKD: unitPrice(l.variant) }));
  const a = input.address;
  const lang: Lang = isLang(body.lang) ? body.lang : DEFAULT_LANG;
  const t = DICTS[lang];

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      email: input.email,
      lang,
      newsletter: input.newsletter,
      lines,
      country: input.country,
      shipping_address: a,
      shipping_method: { id: ship.id, label: ship.label, cost: ship.cost },
      subtotal_hkd: subtotal,
      shipping_hkd: ship.cost,
      total_hkd: total,
    })
    .select('id')
    .single();
  if (error) return Response.json({ error: 'Could not start checkout, please try again' }, { status: 500 });

  const origin = process.env.SITE_URL ?? new URL(req.url).origin;
  const hk = input.country === 'HK';
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    currency: 'hkd',
    locale: lang === 'zh-hk' ? 'zh-HK' : 'en',
    customer_email: input.email,
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: 'hkd',
        unit_amount: l.unitHKD,
        product_data: { name: `${t.product.name} — ${t.variant[l.variant]}` },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: t.shipping[ship.id][0],
          fixed_amount: { amount: ship.cost, currency: 'hkd' },
        },
      },
    ],
    payment_intent_data: {
      shipping: {
        name: `${a.firstName} ${a.lastName}`,
        phone: a.phone,
        address: {
          line1: a.line1,
          line2: a.line2,
          city: hk ? a.area : a.city,
          state: hk ? a.region : undefined,
          postal_code: a.postcode || undefined,
          country: input.country,
        },
      },
    },
    metadata: { order_id: order.id }, // personalisation stays in our DB, not Stripe
    success_url: `${origin}/${lang}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${lang}/cart`,
  });

  await db().from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);
  return Response.json({ url: session.url });
}
