'use client';
import { useEffect } from 'react';
import { setCart } from '@/lib/cart';

export default function ClearCart() {
  useEffect(() => setCart([]), []);
  return null;
}
