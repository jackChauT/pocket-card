// Validates the untrusted checkout body. Throws Error(message) on bad input.
import { HK_REGIONS, isCountry, MAX_QTY, NOTES_MAX, product, shippingFor, type CartLine } from './catalog.ts';

export const PHOTO_EXT = /^(jpe?g|png|heic|heif|webp)$/;
const PHOTO_KEY = /^uploads\/[0-9a-f-]{36}\.(jpe?g|png|heic|heif|webp)$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Address = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  area: string; // HK
  region: string; // HK
  city: string; // intl
  postcode: string; // intl
  phone: string;
};

export type CheckoutInput = {
  lines: CartLine[];
  email: string;
  newsletter: boolean;
  country: string;
  shippingMethod: string;
  address: Address;
};

function text(v: unknown, label: string, { max = 120, required = true } = {}) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) throw new Error(`${label} is required`);
  if (s.length > max) throw new Error(`${label} is too long`);
  return s;
}

function line(raw: any): CartLine {
  if (raw?.productSlug !== product.slug) throw new Error('Unknown product');
  if (raw.variant !== 'ready' && raw.variant !== 'personalised') throw new Error('Unknown variant');
  const quantity = raw.quantity;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) throw new Error('Invalid quantity');
  const out: CartLine = { id: text(raw.id, 'Line id', { max: 64 }), productSlug: product.slug, variant: raw.variant, quantity };
  if (raw.variant === 'personalised') {
    const p = raw.personalisation;
    if (p?.method === 'whatsapp') out.personalisation = { method: 'whatsapp' };
    else if (p?.method === 'upload') {
      if (typeof p.photoKey !== 'string' || !PHOTO_KEY.test(p.photoKey)) throw new Error('Photo is missing, please re-upload it');
      out.personalisation = {
        method: 'upload',
        photoKey: p.photoKey,
        photoName: text(p.photoName, 'Photo name', { max: 200, required: false }),
        notes: text(p.notes, 'Notes', { max: NOTES_MAX, required: false }),
      };
    } else throw new Error('Choose how to send your photo');
  }
  return out;
}

export function parseCheckout(body: any): CheckoutInput {
  if (!Array.isArray(body?.lines) || body.lines.length === 0) throw new Error('Your cart is empty');
  if (body.lines.length > 20) throw new Error('Too many items');
  const email = text(body.email, 'Email', { max: 200 }).toLowerCase();
  if (!EMAIL.test(email)) throw new Error('Enter a valid email');
  const country = body.country;
  if (!isCountry(country)) throw new Error('Choose a country');
  const shippingMethod = body.shippingMethod;
  if (!shippingFor(country).some((m) => m.id === shippingMethod)) throw new Error('Choose a shipping method');

  const a = body.address ?? {};
  const hk = country === 'HK';
  const region = hk ? text(a.region, 'Region') : '';
  if (hk && !HK_REGIONS.includes(region)) throw new Error('Choose a region');
  const address: Address = {
    firstName: text(a.firstName, 'First name'),
    lastName: text(a.lastName, 'Last name'),
    line1: text(a.line1, 'Flat, floor, building', { max: 200 }),
    line2: text(a.line2, 'Street address', { max: 200 }),
    area: hk ? text(a.area, 'Area') : '',
    region,
    city: hk ? '' : text(a.city, 'City / state'),
    postcode: hk ? '' : text(a.postcode, 'Postcode', { max: 20, required: false }),
    phone: text(a.phone, 'Phone', { max: 30 }),
  };
  if (address.phone.replace(/\D/g, '').length < 6) throw new Error('Enter a phone number for the courier');

  return { lines: body.lines.map(line), email, newsletter: body.newsletter === true, country, shippingMethod, address };
}
