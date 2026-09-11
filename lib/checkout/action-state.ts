// lib/checkout/action-state.ts
//
// Dipisah dari actions.ts: file ber-'use server' hanya boleh
// mengekspor fungsi async.
import type { PlacedOrder } from './queries';

export type CheckoutActionState = {
  ok: boolean;
  error: string | null;
  order: PlacedOrder | null;
};

export const initialCheckoutState: CheckoutActionState = {
  ok: false,
  error: null,
  order: null,
};
