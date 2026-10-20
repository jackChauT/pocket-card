// Shared by client (display) and server (the only prices that count).
// All money is HKD cents. Customer-facing wording lives in lib/dict.ts; names here are for staff and Stripe.
import { LOCALE_TAG, type Lang } from './i18n.ts';

export const STUDIO_NAME = 'Studio Name'; // placeholder
export const WHATSAPP_NUMBER = '852XXXXXXXX'; // placeholder: digits only, for wa.me
export const WHATSAPP_DISPLAY = '+852 [your WhatsApp number]'; // placeholder

/** Browse-only build for GitHub Pages: no checkout, upload or accounts. */
export const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';
// next/image doesn't add basePath to string srcs, so public files need it by hand.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export type Variant = 'ready' | 'personalised';

export const product = {
  slug: 'christmas-market',
  name: 'Christmas Market', // placeholder
  basePriceHKD: 4500, // placeholder
  personalisationFeeHKD: 3000, // placeholder
  images: { ready: `${BASE_PATH}/christmas-card.jpg`, personalised: `${BASE_PATH}/christmas-card-personalised.jpg` },
  imageSize: { width: 1054, height: 1492 },
} as const;

export type CartLine = {
  id: string;
  productSlug: string;
  variant: Variant;
  quantity: number;
  personalisation?: {
    method: 'upload' | 'whatsapp';
    photoKey?: string; // private storage object key
    photoName?: string;
    notes?: string; // ≤ 200 chars
  };
};

export const MAX_QTY = 99;
export const NOTES_MAX = 200;

export const unitPrice = (v: Variant) =>
  product.basePriceHKD + (v === 'personalised' ? product.personalisationFeeHKD : 0);

export const variantLabel = (v: Variant) => (v === 'personalised' ? 'Personalised' : 'Ready-made');

export const hkd = (cents: number) =>
  'HK$' + (cents / 100).toLocaleString('en', { maximumFractionDigits: 2 });

// Every ISO country except uninhabited territories and places Stripe can't serve (CU, IR, KP, SY).
// Edit this list to stop shipping somewhere.
const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IS IT JE JM JO JP KE KG KH
KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW
MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB
SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ
VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW`.split(/\s+/);

export const isCountry = (code: unknown) => typeof code === 'string' && COUNTRY_CODES.includes(code);

// Names come from the platform's Intl data; overrides use the short everyday name.
const NAME_OVERRIDES: Record<Lang, Record<string, string>> = {
  en: { HK: 'Hong Kong', MO: 'Macau', TW: 'Taiwan', XK: 'Kosovo' },
  'zh-hk': { HK: '香港', MO: '澳門', TW: '台灣', XK: '科索沃' },
};
const regionNames = { en: new Intl.DisplayNames(['en'], { type: 'region' }), 'zh-hk': new Intl.DisplayNames(['zh-Hant-HK'], { type: 'region' }) };
export const countryName = (code: string, lang: Lang = 'en') => NAME_OVERRIDES[lang][code] ?? regionNames[lang].of(code) ?? code;

const countryLists: Partial<Record<Lang, [string, string][]>> = {};
/** Hong Kong first, then alphabetical (English) or by stroke order (Chinese). */
export function countries(lang: Lang = 'en'): [code: string, name: string][] {
  const collator = new Intl.Collator(LOCALE_TAG[lang]);
  return (countryLists[lang] ??= [
    'HK',
    ...COUNTRY_CODES.filter((c) => c !== 'HK').sort((a, b) => collator.compare(countryName(a, lang), countryName(b, lang))),
  ].map((c) => [c, countryName(c, lang)]));
}

export const HK_REGIONS = ['Hong Kong Island', 'Kowloon', 'New Territories', 'Outlying Islands'];

export type ShippingMethod = { id: string; label: string; note: string; cost: number };

// placeholder rates. International is one flat rate worldwide; split into zones here if your courier prices by region.
const HK_SHIPPING: ShippingMethod[] = [
  { id: 'sf', label: 'SF Express', note: 'Courier to your door · 1–2 working days after dispatch', cost: 3000 },
  { id: 'post', label: 'Hongkong Post', note: 'Local mail · 2–4 working days after dispatch', cost: 1000 },
];
const INTL_SHIPPING: ShippingMethod[] = [
  { id: 'air', label: 'Hongkong Post Air Mail', note: 'Untracked · 7–21 working days after dispatch', cost: 6000 },
  { id: 'intl', label: 'Tracked international', note: 'Tracked courier · 4–8 working days after dispatch', cost: 16000 },
];

export const shippingFor = (country: string) => (country === 'HK' ? HK_SHIPPING : INTL_SHIPPING);

export function priceOrder(lines: Pick<CartLine, 'variant' | 'quantity'>[], country: string, methodId: string) {
  const ship = shippingFor(country).find((m) => m.id === methodId);
  if (!ship) throw new Error('Choose a shipping method');
  const subtotal = lines.reduce((sum, l) => sum + unitPrice(l.variant) * l.quantity, 0);
  return { subtotal, ship, total: subtotal + ship.cost };
}

export const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
