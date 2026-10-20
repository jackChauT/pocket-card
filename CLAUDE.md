# Card Studio Website

E-commerce site for an independent illustration studio in Hong Kong. It sells one Christmas card, Ready-made or Personalised.

- **Spec:** `HANDOFF.md` is the source of truth for behaviour, tokens, data model and the Stripe flow. Read it before starting any feature.
- **Visual reference:** `design/*.dc.html`, one file per screen, desktop and mobile. Match their spacing, type sizes, colours and copy exactly. Rebuild the canvas-runtime tags (`<sc-if>`, `<sc-for>`, `<dc-import>`, `{{…}}`) as React.
- **Artwork:** `assets/`. `christmas-card` is the ready-made image; `christmas-card-personalised` is the same card with the customisable areas circled.

## Rules
- Keep the UI quiet: the illustrations provide the colour. No gradients, heavy shadows or extra badges.
- Only one "Shop Card" CTA on the homepage. Personalisation lives on the product page only.
- Currency is HKD. Always price on the server. Card details are handled only by Stripe Checkout.
- Customer photos go to private storage. Only store object keys in carts and orders.
- Use real `<button>`, `<a>`, `<input>` and `<label>` elements. Touch targets ≥ 44px.
- Leave placeholder values (`[X]`, `Studio Name`, the WhatsApp number) visibly marked. Don't invent real ones.
