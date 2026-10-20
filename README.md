# Card Studio

One Next.js app, frontend and backend together. Spec: `HANDOFF.md`.

| Part | Tech |
|---|---|
| Pages and API | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 |
| Database, file storage, sign-in | Supabase: Postgres, a private Storage bucket, Auth magic links |
| Payments | Stripe Checkout and a webhook |
| Email | Resend (HTTP API) |
| Hosting | Vercel |

## Run

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
npm test                     # pricing, validation and order-status rules
```

The shop pages work without keys. Accounts, upload, checkout and admin need them.

## Setup

1. **Supabase**
   - Create a project and run `supabase/schema.sql` in the SQL editor.
   - Copy the URL, the anon key and the service role key into `.env.local`.
   - Under Authentication → URL Configuration, set Site URL to `SITE_URL` and add `SITE_URL/auth/confirm` to Redirect URLs.
   - Recommended: in Authentication → Emails → Magic Link, change the link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account`. Then the link works even when opened on a different device from the one that asked for it.
   - Set up custom SMTP (e.g. Resend) under Authentication → SMTP. Supabase's built-in sender is rate-limited.
2. **Stripe**
   - Copy the secret key into `.env.local`.
   - For local webhooks, run `stripe listen --forward-to localhost:3077/api/stripe/webhook` and use the `whsec_…` it prints.
3. **Resend**
   - Verify your domain and set `RESEND_API_KEY` and `EMAIL_FROM`.
4. **Admin**
   - Put studio emails in `ADMIN_EMAILS`. Sign in at `/account`, then open `/admin`.
5. **Deploy (Vercel)**
   - Set the same env vars, with `SITE_URL` set to your domain.
   - Add a Stripe webhook for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

## Order flow

```
pending_payment → received ─────────────────────────────→ preparing → packed → shipped
                ↘ awaiting_photo (WhatsApp) → received ↗
   personalised:  received → proof_sent ⇄ changes_requested
                             proof_sent → approved → preparing …
```

- The studio uploads a sketch in `/en/admin/orders/[id]` and the customer is emailed a link to review it.
- The customer approves it, or asks for changes, from `/[lang]/account/orders/[id]`.
- The server won't move a personalised order to printing until the sketch is approved (`lib/orders.ts`).
- Customer accounts match orders by the email the customer signs in with, so guest orders appear once they sign in.

## Languages

- English is at `/en/…` and Traditional Chinese (Hong Kong) at `/zh-hk/…`. A bare URL like `/shop` redirects to the visitor's last choice (cookie), or to their browser language.
- All customer copy is in `lib/dict.ts`. The Chinese dictionary is type-checked against the English one, so a missing string fails the build.
- Each order stores its language, and customer emails are sent in it. Stripe Checkout opens in the same language.
- Admin and staff emails are English only.
- Supabase's magic-link email is one template for everyone. Write it in both languages in Authentication → Emails.

## Where things live

- `lib/catalog.ts`: product, prices, countries, shipping rates, placeholders
- `lib/dict.ts`: all customer-facing text, English and 繁體中文
- `lib/checkout.ts`: server-side validation of the checkout body
- `lib/orders.ts`: order statuses and the rules between them
- `app/api/*`: upload URL, Stripe session, webhook (confirmation email)
- `app/[lang]/(site)/account`: sign-in, order history, sketch review
- `app/[lang]/admin`: order queue, sketch upload, status and tracking
