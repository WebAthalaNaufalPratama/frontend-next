// lib/cart/data.ts
import { describeGraphQLError } from '@/lib/auth/errors';
import { identifiedRequest } from '@/lib/wp-request';

import { CART_QUERY, type Cart, type CartResponse } from './queries';

/**
 * Cart selalu dibaca per request (bawa cookie sesi), jadi tidak pernah di-cache.
 * Mengembalikan null kalau WordPress bermasalah, supaya UI bisa tetap tampil.
 */
export async function getCart(): Promise<Cart | null> {
  try {
    const data = await identifiedRequest<CartResponse>(CART_QUERY);
    return data.cart ?? null;
  } catch (error) {
    console.error('[cart] gagal mengambil cart:', describeGraphQLError(error));
    return null;
  }
}
