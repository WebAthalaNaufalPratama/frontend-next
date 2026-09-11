'use server';

import { revalidatePath } from 'next/cache';

import { describeGraphQLError, toPublicErrorMessage } from '@/lib/auth/errors';
import { identifiedRequest } from '@/lib/wp-request';

import type { CartActionState } from './action-state';
import {
  ADD_TO_CART_MUTATION,
  REMOVE_ITEMS_MUTATION,
  UPDATE_QUANTITY_MUTATION,
} from './queries';

function refreshCartViews() {
  revalidatePath('/cart');
  revalidatePath('/products');
}

function toPositiveInt(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function addToCartAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = toPositiveInt(formData.get('productId'));
  const quantity = toPositiveInt(formData.get('quantity')) ?? 1;

  if (productId === null) {
    return { ok: false, error: 'Produk tidak valid.' };
  }

  try {
    await identifiedRequest(ADD_TO_CART_MUTATION, { productId, quantity });
    refreshCartViews();
    return { ok: true, error: null };
  } catch (error) {
    console.error('[cart] addToCart gagal:', describeGraphQLError(error));
    return {
      ok: false,
      error: toPublicErrorMessage(error, 'Produk gagal ditambahkan ke keranjang.'),
    };
  }
}

export async function updateQuantityAction(formData: FormData): Promise<void> {
  const key = formData.get('key');
  const quantity = Number(formData.get('quantity'));

  if (typeof key !== 'string' || !key || !Number.isInteger(quantity) || quantity < 0) {
    return;
  }

  try {
    // quantity 0 dipakai WooCommerce untuk menghapus baris.
    await identifiedRequest(UPDATE_QUANTITY_MUTATION, { items: [{ key, quantity }] });
    refreshCartViews();
  } catch (error) {
    console.error('[cart] updateItemQuantities gagal:', describeGraphQLError(error));
  }
}

export async function removeItemAction(formData: FormData): Promise<void> {
  const key = formData.get('key');

  if (typeof key !== 'string' || !key) return;

  try {
    await identifiedRequest(REMOVE_ITEMS_MUTATION, { keys: [key] });
    refreshCartViews();
  } catch (error) {
    console.error('[cart] removeItemsFromCart gagal:', describeGraphQLError(error));
  }
}
