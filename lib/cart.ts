'use client';
// Client cart in localStorage. Prices here are display-only; the server re-prices.
import { useSyncExternalStore } from 'react';
import type { CartLine } from './catalog';

const KEY = 'cart:v1';
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export function setCart(next: CartLine[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export const updateLine = (id: string, patch: Partial<CartLine>) =>
  setCart(read().map((l) => (l.id === id ? { ...l, ...patch } : l)));

export const removeLine = (id: string) => setCart(read().filter((l) => l.id !== id));

export function addLine(line: CartLine) {
  const lines = read();
  // Ready-made lines merge; personalised lines stay separate (each has its own photo).
  const same = line.variant === 'ready' && lines.find((l) => l.variant === 'ready' && l.productSlug === line.productSlug);
  if (same) updateLine(same.id, { quantity: Math.min(99, same.quantity + line.quantity) });
  else setCart([...lines, line]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);
