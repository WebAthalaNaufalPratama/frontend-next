// lib/checkout/data.ts
import { describeGraphQLError } from '@/lib/auth/errors';
import { identifiedRequest } from '@/lib/wp-request';

import { STORE_COUNTRY } from './config';
import {
  CHECKOUT_OPTIONS_QUERY,
  type CheckoutOptions,
  type CheckoutOptionsResponse,
} from './queries';

const EMPTY: CheckoutOptions = {
  gateways: [],
  states: [],
  rates: [],
  cartIsEmpty: true,
  cartTotal: null,
  needsShippingAddress: false,
};

export async function getCheckoutOptions(): Promise<CheckoutOptions> {
  try {
    const data = await identifiedRequest<CheckoutOptionsResponse>(CHECKOUT_OPTIONS_QUERY, {
      country: STORE_COUNTRY,
    });

    return {
      gateways: data.paymentGateways?.nodes ?? [],
      states: data.countryStates ?? [],
      // availableShippingMethods adalah daftar per paket kiriman; untuk cart
      // sederhana hanya ada satu paket, jadi tarifnya diratakan.
      rates: (data.cart?.availableShippingMethods ?? []).flatMap((m) => m.rates ?? []),
      cartIsEmpty: data.cart?.isEmpty ?? true,
      cartTotal: data.cart?.total ?? null,
      needsShippingAddress: data.cart?.needsShippingAddress ?? false,
    };
  } catch (error) {
    console.error('[checkout] gagal mengambil opsi:', describeGraphQLError(error));
    return EMPTY;
  }
}
