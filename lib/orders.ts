// Order statuses and the rules between them. Pure: shared by admin, account and tests.
import type { CartLine } from './catalog.ts';
import type { Address } from './checkout.ts';
import type { Lang } from './i18n.ts';

export const ORDER_STATUSES = [
  'pending_payment',
  'awaiting_photo',
  'received',
  'proof_sent',
  'changes_requested',
  'approved',
  'preparing',
  'packed',
  'shipped',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];


export type OrderLine = CartLine & { unitHKD: number };

export type Order = {
  id: string;
  number: number;
  lang: Lang;
  status: OrderStatus;
  email: string;
  newsletter: boolean;
  lines: OrderLine[];
  country: string;
  shipping_address: Address;
  shipping_method: { id: string; label: string; cost: number };
  subtotal_hkd: number;
  shipping_hkd: number;
  total_hkd: number;
  proof_key: string | null;
  proof_message: string | null;
  proof_feedback: string | null;
  proof_sent_at: string | null;
  approved_at: string | null;
  tracking: string | null;
  created_at: string;
  paid_at: string | null;
};

export const isPersonalised = (lines: CartLine[]) => lines.some((l) => l.variant === 'personalised');
export const needsWhatsAppPhoto = (lines: CartLine[]) => lines.some((l) => l.personalisation?.method === 'whatsapp');

const PRINTING: OrderStatus[] = ['preparing', 'packed', 'shipped'];
const PROOF: OrderStatus[] = ['proof_sent', 'changes_requested', 'approved'];

/** Why the studio can't move this order to `next`, or null if it can. */
export function statusError(order: Pick<Order, 'lines' | 'approved_at' | 'proof_key'>, next: OrderStatus): string | null {
  if (!ORDER_STATUSES.includes(next) || next === 'pending_payment') return 'Unknown status';
  const personal = isPersonalised(order.lines);
  if (!personal && (PROOF.includes(next) || next === 'awaiting_photo')) return 'Ready-made orders have no sketch step';
  if (personal && next === 'proof_sent') return 'Upload a sketch to send it';
  if (personal && next === 'approved' && !order.proof_key) return 'Send a sketch before marking it approved';
  if (personal && PRINTING.includes(next) && !order.approved_at)
    return 'The customer has not approved the sketch yet. Mark it approved if they confirmed another way.';
  return null;
}

/** Customer-facing timeline: step keys (see dict `timeline`) plus the index of the current one. */
export function timeline(status: OrderStatus, personalised: boolean) {
  const steps: { key: string; statuses: OrderStatus[] }[] = [
    { key: 'received', statuses: ['pending_payment', 'awaiting_photo', 'received'] },
    ...(personalised ? [{ key: 'sketch', statuses: PROOF }] : []),
    { key: personalised ? 'printing' : 'preparing', statuses: ['preparing'] },
    { key: 'packed', statuses: ['packed'] },
    { key: 'shipped', statuses: ['shipped'] },
  ];
  return { steps, current: steps.findIndex((s) => s.statuses.includes(status)) };
}

/** Staff-facing labels (admin is English-only). Customer labels live in lib/dict.ts. */
export const ADMIN_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  awaiting_photo: 'Waiting for photo (WhatsApp)',
  received: 'Order received',
  proof_sent: 'Sketch sent, waiting for customer',
  changes_requested: 'Changes requested',
  approved: 'Sketch approved',
  preparing: 'Preparing & printing',
  packed: 'Packed',
  shipped: 'Shipped',
};
