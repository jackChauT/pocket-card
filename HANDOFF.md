# Card Studio Website — Build Handoff

A handoff for building the design into a production website with Claude Code.
The design lives in `design/` (one file per screen) and the card artwork in `assets/`.
**This document is the spec; the design files are the visual reference.**

---

## 1. What we're building

A minimal, gallery-feeling e-commerce site for an independent illustration studio in **Hong Kong**.
It sells **one physical Christmas card** in two variants:

| Variant | Price | What the customer gets |
|---|---|---|
| Ready-made | HK$45 *(placeholder)* | The illustration exactly as drawn |
| Personalised | HK$45 + HK$30 = HK$75 *(placeholder)* | **The same design.** Only the characters in 3 marked areas are redrawn from the customer's photo |

Personalised customers either **upload a photo on the product page** or **send it on WhatsApp** after ordering.

Payments go through **Stripe Checkout**. The site never collects or stores card details.
Currency is **HKD**. Shipping goes to Hong Kong and abroad.

The site's personality should come from the artwork. The UI stays calm and out of the way.

---

## 2. Suggested stack

- **Next.js (App Router) + TypeScript**, deployed on Vercel
- **Tailwind CSS**, with the tokens in §4 set up as theme values
- **Stripe Checkout** (hosted) and a webhook route
- **File storage** for customer photos (Vercel Blob, Supabase Storage or S3), uploaded through signed/private URLs
- **Database** for orders (Postgres via Supabase, Neon or Prisma)
- **Transactional email**: Resend, or Stripe's own receipts
- Products can stay in a typed config file for now (one product). Move them to a CMS or DB when the range grows.

---

## 3. The design files

`design/*.dc.html` are HTML files from the design canvas. Treat them as **visual and copy reference**:

- Markup is plain HTML with inline styles, so read the exact spacing, sizes and colours off them.
- The `<x-dc>`, `<sc-if>`, `<sc-for>`, `<dc-import>` tags and `{{holes}}` belong to the canvas runtime. Rebuild them as React components, conditionals and loops.
- Each file's `<script type="text/x-dc">` block holds the interaction logic: variant toggle, image swap, quantity, shipping-by-country and so on. Port that logic into React state.
- Image paths already point at `../assets/`.

| File | Screen |
|---|---|
| `Main.dc.html` | Home (desktop) |
| `Shop.dc.html` | Shop — the single product |
| `Product.dc.html` | Product detail with the Ready-made / Personalised flow |
| `Cart.dc.html` | Cart |
| `Checkout.dc.html` | Details + shipping page, then redirect to Stripe |
| `Confirmation.dc.html` | Order confirmation |
| `Mobile-Home.dc.html`, `Mobile-Product.dc.html`, `Mobile-Checkout.dc.html` | Mobile versions (390px) |
| `Header.dc.html`, `Footer.dc.html` | Shared components |

---

## 4. Design tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| `bg` | `#F6F2EC` | Page background (warm off-white) |
| `surface` | `#FBF8F3` | Inputs, selected options |
| `panel` | `#EFE8DE` | Summary boxes, personalisation panel |
| `tile` | `#ECE5DA` | Product image backdrops |
| `tile-deep` | `#E8DFD2` / `#E6DCCE` | Hero image panel |
| `line` | `#E4DDD3` | Dividers |
| `line-input` | `#D6CEC2` | Input and option borders |
| `ink` | `#211E1A` | Text, primary buttons |
| `ink-hover` | `#3B342D` | Primary button hover |
| `text-2` | `#4A443D` | Body copy |
| `muted` | `#6A6259` | Captions, labels (passes 4.5:1 on `bg`) |
| `accent` | `#8C4A30` | Small labels, hover, focus ring |
| `mark` | `#D23B2A` | Red circle legend; matches the artwork's circles |
| `kraft` | `#CFAE85` | Envelope in hero compositions |

### Type
- **Display:** Instrument Serif 400 (and italic), for headings. Sizes: 88/72/60/56/52px on desktop, 46/38px on mobile. Line-height ~1.0, letter-spacing −0.01 to −0.02em.
- **UI / body:** Figtree 400/500/600, 13–19px, line-height 1.5–1.7.
- **Eyebrows:** 12–13px, uppercase, letter-spacing 0.12em, `muted`.
- Load both from Google Fonts (`next/font/google`).

### Shape and motion
- Radius 2px on buttons and inputs; 999px on pills and segmented controls.
- Shadows only on card artwork: `0 1px 1px rgba(33,30,26,.06), 0 16px 34px -12px rgba(33,30,26,.28)`.
- Transitions: 0.2s for colour; 0.35s `cubic-bezier(.2,.7,.2,1)` for reveals; 0.45s opacity cross-fade for the product image swap.
- Touch targets ≥ 44px. Focus ring 2px `accent`, offset 3px.
- Page gutter 56px on desktop, 20px on mobile. Max layout width 1440.

---

## 5. Pages and behaviour

### Header (all pages except checkout)
Logo · Shop · About · Search (icon) · Cart (count). Thin (72px), with a bottom border.
Mobile: menu, centred logo, search, cart with a count badge.

### Home
1. **Hero:** eyebrow "Original illustrated greeting cards · Hong Kong", H1 "Cards made to hold a little story.", supporting line, **one button: "Shop Card"**. The right panel shows the card at a slight tilt on a kraft envelope.
2. **How it works** strip, three steps: Ready-made or personalised → Share a photo, if personalising → Printed and posted.
3. **Product spotlight**, "Made for giving": large image, name, "From HK$45", description, a two-row list of the variants, and a "View the card →" text link. No second button.
4. **Brand story:** "Illustrated with a story in mind." plus a studio photo placeholder and an "Our Story →" link.
5. Footer.

> Rule: "Shop Card" is the only button-style CTA on the homepage. There is no separate Personalise section or button.

### Shop
Title, one line of copy, and the single product as a large tile (image, name, "From HK$45", "Ready-made or personalised from your photo", "View the card →"). No filters while there's only one product.

### Product detail (the key screen)
- **Layout:** image left (sticky), info right. On mobile the image sits on top, with a sticky bottom bar showing price + Add to Cart.
- **Image swap:** Ready-made shows `christmas-card.*`; Personalised cross-fades to `christmas-card-personalised.*` (the version with red circles). A caption chip updates to match.
- **"Choose your card"** uses real radio inputs: Ready-made HK$45 / Personalised +HK$30.
- **When Personalised is selected**, a panel slides in with:
  - Heading "Same design, your people." and the explanation that only the circled characters are redrawn from your photo and everything else stays as shown.
  - A legend of the three areas: the couple beside the market stall; the pair at the café table; the parent and child in the foreground.
  - A segmented control: **Upload here** | **Send on WhatsApp**.
    - *Upload:* a drop zone (`accept="image/*"`, JPG/PNG/HEIC) showing "Photo added: filename" once chosen, plus an optional notes field (200 characters) and a small WhatsApp text link.
    - *WhatsApp:* an explanation (check out, then send photos with your order number), a "Chat with us on WhatsApp" button (`https://wa.me/852XXXXXXXX?text=…`), and the number shown.
  - Tip: clear, well-lit photos where faces are visible work best.
- **Quantity stepper + Add to Cart** show the live total.
- Reassurance line: Printed with care · Ships from Hong Kong · Secure checkout.
- **Accordions** (`<details>`): Product details, Personalisation, Shipping & delivery, Returns.

### Cart
Line items show thumbnail, name, variant, unit price, **personalisation details (photo filename / "via WhatsApp", notes)**, quantity stepper, line total, Edit and Remove. The summary shows the subtotal, "Shipping calculated at checkout", a Checkout button and "Secure payment with Stripe · Prices in HKD".

### Checkout (our page, before Stripe)
Minimal header ("Secure checkout"). Progress: Cart — Details & shipping — Payment — Confirmation.
- **Contact:** email, plus an opt-in checkbox for the newsletter.
- **Address:** starts with **Country / region**.
  - **Hong Kong:** name, flat/floor/building, street, **Area**, **Region** (HK Island / Kowloon / New Territories / Outlying Islands). No postcode.
  - **Other countries:** city/state and postcode, plus a note about import duties.
  - Phone, pre-filled with `+852`.
- **Shipping method** depends on the country:
  - HK: SF Express HK$30 · Hongkong Post local HK$10
  - International: Hongkong Post Air Mail HK$60 · Tracked international HK$160
- The order summary on the right updates the total live.
- Button: **"Continue to secure payment"** redirects to Stripe Checkout. Copy: "We never see or store your card details."
- Mobile: a single scrolling page, a collapsible order summary at the top, and a sticky "Pay HK$… securely" button.

### Order confirmation
Heading "Thank you — your card is on its way to becoming something special." Shows the order number and email, then a four-step timeline (Order received → Preparing & printing → Packed → Shipped) and "We'll email you again when your order has been dispatched." Then the items with personalisation details, shipping address, shipping method and total paid.

---

## 6. Data model (starting point)

```ts
type Variant = 'ready' | 'personalised';

type Product = {
  slug: 'christmas-market';
  name: string;
  basePriceHKD: number;          // 4500 (cents)
  personalisationFeeHKD: number; // 3000
  images: { ready: string; personalised: string };
  personalisableAreas: string[]; // the 3 circled areas
};

type CartLine = {
  id: string;
  productSlug: string;
  variant: Variant;
  quantity: number;
  personalisation?: {
    method: 'upload' | 'whatsapp';
    photoKey?: string;   // storage object key (private)
    photoName?: string;
    notes?: string;      // ≤ 200 chars
  };
};

type OrderStatus = 'received' | 'awaiting_photo' | 'preparing' | 'packed' | 'shipped';
```

- The cart lives client-side (localStorage or cookie). Re-price it on the server; never trust client prices.
- A personalised order with `method: 'whatsapp'` starts as `awaiting_photo`.

---

## 7. Stripe integration

1. `POST /api/checkout` receives the cart, contact details, address and chosen shipping method.
2. The server validates and re-prices everything, then creates a **Checkout Session**:
   - `mode: 'payment'`, `currency: 'hkd'`. HKD uses cents, so HK$45 is `unit_amount: 4500`.
   - `line_items`: one per cart line, using separate Prices for the Ready-made and Personalised variants.
   - `shipping_options`: one fixed-amount option for the method the customer chose.
   - `customer_email`, and `payment_intent_data.shipping` with the address collected on our page.
   - `metadata`: order ID. Keep the personalisation details (photo key, notes, method) in **your DB**, keyed by that order ID, not in Stripe metadata.
   - `success_url: /order/confirmation?session_id={CHECKOUT_SESSION_ID}`, `cancel_url: /cart`.
3. The `checkout.session.completed` webhook marks the order paid, sets its status, and sends the confirmation email. For WhatsApp orders, the email includes the WhatsApp link and the order number.
4. The confirmation page fetches the order by `session_id` from the server.
5. **Photo uploads:** upload to private storage on the product page, *before* checkout, and keep only the object key in the cart. Delete photos after [N] days of fulfilment (privacy).

To add countries later, you only need to add countries and rates. The flow stays the same.

---

## 8. Placeholders to replace before launch

- Brand name ("Studio Name") and "[Illustrator name]"
- Product name ("Christmas Market")
- Prices (HK$45 / +HK$30) and all shipping rates
- Dispatch times and returns window (`[X]`)
- WhatsApp number (`+852 [number]`)
- Card specs: A6, 300gsm recycled, "Printed in Hong Kong"
- Studio photograph
- Links: Instagram, Pinterest, Etsy, Pinkoi, FAQ, Privacy, Terms

**Open decision:** do personalised orders get a sketch sent for approval before printing? If yes, add a `proof_sent` / `approved` status and an email step.

---

## 9. Acceptance checklist

- [ ] A customer understands within 5 seconds: original illustrated physical card; can be personalised; how to buy
- [ ] Only one "Shop Card" CTA on the homepage; no separate Personalise section
- [ ] Choosing Personalised swaps to the circled image; switching back restores the normal image
- [ ] The upload works on iOS and Android camera rolls (HEIC accepted); the WhatsApp option works without an upload
- [ ] Checkout fields and shipping options switch correctly between Hong Kong and international
- [ ] Prices are recalculated on the server; Stripe receives HKD amounts in cents
- [ ] No card data touches our servers
- [ ] Mobile: sticky Add to Cart / Pay bars, ≥44px targets, 16px inputs (no iOS zoom)
- [ ] Lighthouse accessibility ≥ 95; all images have alt text; visible focus states
