import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hkd, priceOrder } from './catalog.ts';
import { parseCheckout } from './checkout.ts';
import { statusError, timeline } from './orders.ts';

const key = 'uploads/123e4567-e89b-12d3-a456-426614174000.heic';
const valid = () => ({
  email: 'sam@example.com',
  country: 'HK',
  shippingMethod: 'sf',
  address: { firstName: 'Sam', lastName: 'Lee', line1: 'Flat 12B', line2: '8 Sample Road', area: 'Sheung Wan', region: 'Kowloon', phone: '+852 9123 4567' },
  lines: [
    { id: 'a', productSlug: 'christmas-market', variant: 'personalised', quantity: 1, personalisation: { method: 'upload', photoKey: key, photoName: 'x.heic', notes: 'hi' } },
    { id: 'b', productSlug: 'christmas-market', variant: 'ready', quantity: 2, unitPrice: 1 },
  ],
});

test('prices on the server, in cents, ignoring client prices', () => {
  const input = parseCheckout(valid());
  const { subtotal, ship, total } = priceOrder(input.lines, input.country, input.shippingMethod);
  assert.equal(subtotal, 7500 + 2 * 4500);
  assert.equal(ship.cost, 3000);
  assert.equal(total, 19500);
  assert.equal(hkd(total), 'HK$195');
});

test('rejects tampered input', () => {
  const bad = (mutate: (b: any) => void, msg: RegExp) => {
    const b = valid();
    mutate(b);
    assert.throws(() => parseCheckout(b), msg);
  };
  bad((b) => (b.lines[1].quantity = 0), /quantity/);
  bad((b) => (b.lines[1].quantity = 1.5), /quantity/);
  bad((b) => (b.lines[1].variant = 'free'), /variant/);
  bad((b) => (b.lines[0].personalisation.photoKey = '../secret.jpg'), /Photo/);
  bad((b) => (b.lines[0].personalisation.notes = 'x'.repeat(201)), /Notes/);
  bad((b) => (b.shippingMethod = 'air'), /shipping/); // intl method for HK
  bad((b) => (b.address.region = 'Mars'), /region/);
  bad((b) => (b.email = 'nope'), /email/);
  bad((b) => (b.lines = []), /empty/);
});

test('international address needs city, not area', () => {
  const b: any = valid();
  b.country = 'GB';
  b.shippingMethod = 'intl';
  assert.throws(() => parseCheckout(b), /City/);
  b.address.city = 'London';
  const input = parseCheckout(b);
  assert.equal(input.address.area, '');
  assert.equal(priceOrder(input.lines, 'GB', 'intl').total, 16500 + 16000);
});

test('whatsapp personalisation needs no photo', () => {
  const b: any = valid();
  b.lines[0].personalisation = { method: 'whatsapp' };
  assert.deepEqual(parseCheckout(b).lines[0].personalisation, { method: 'whatsapp' });
});


test('personalised orders cannot be printed before the sketch is approved', () => {
  const personal = { lines: valid().lines as any, approved_at: null, proof_key: null };
  assert.match(statusError(personal, 'preparing')!, /not approved/);
  assert.match(statusError(personal, 'shipped')!, /not approved/);
  assert.match(statusError(personal, 'approved')!, /Send a sketch/);
  assert.match(statusError(personal, 'proof_sent')!, /Upload/);
  assert.equal(statusError({ ...personal, proof_key: 'proofs/x.jpg' }, 'approved'), null);
  assert.equal(statusError({ ...personal, approved_at: '2026-12-01' }, 'preparing'), null);

  const ready = { lines: [valid().lines[1]] as any, approved_at: null, proof_key: null };
  assert.equal(statusError(ready, 'preparing'), null);
  assert.match(statusError(ready, 'proof_sent')!, /no sketch/);
  assert.match(statusError(ready, 'pending_payment')!, /Unknown/);
});

test('timeline shows the sketch step only for personalised orders', () => {
  assert.equal(timeline('proof_sent', true).steps[timeline('proof_sent', true).current].key, 'sketch');
  assert.ok(!timeline('received', false).steps.some((s) => s.key === 'sketch'));
  assert.equal(timeline('preparing', false).current, 1);
  assert.equal(timeline('shipped', true).current, 4);
});

test('ships to every listed country, Hong Kong first', async () => {
  const { countries } = await import('./catalog.ts');
  assert.deepEqual(countries('en')[0], ['HK', 'Hong Kong']);
  assert.deepEqual(countries('zh-hk')[0], ['HK', '香港']);
  assert.ok(countries('en').length > 200);
  assert.equal(countries('zh-hk').find(([c]) => c === 'GB')?.[1], '英國');
  const b: any = valid();
  Object.assign(b, { country: 'BR', shippingMethod: 'air' });
  b.address.city = 'São Paulo';
  assert.equal(parseCheckout(b).country, 'BR');
  b.country = 'KP';
  assert.throws(() => parseCheckout(b), /country/);
});

test('language: browser preference and URL switching', async () => {
  const { pickLang, switchPath } = await import('./i18n.ts');
  assert.equal(pickLang('zh-HK,zh;q=0.9,en;q=0.8'), 'zh-hk');
  assert.equal(pickLang('zh-TW'), 'zh-hk');
  assert.equal(pickLang('en-US,en;q=0.9,zh-HK;q=0.8'), 'en');
  assert.equal(pickLang('fr-FR,zh;q=0.5'), 'zh-hk');
  assert.equal(pickLang('fr-FR'), 'en');
  assert.equal(pickLang(null), 'en');
  assert.equal(switchPath('/en/shop/christmas-market', 'zh-hk'), '/zh-hk/shop/christmas-market');
  assert.equal(switchPath('/zh-hk', 'en'), '/en');
  assert.equal(switchPath('/cart', 'zh-hk'), '/zh-hk/cart');
});
