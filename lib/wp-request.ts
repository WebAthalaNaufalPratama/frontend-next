// lib/wp-request.ts
//
// Server-only. Pembungkus tipis di atas getClient() yang mengurus dua hal
// yang selalu berulang: menempelkan token auth, dan menjaga sesi cart
// WooCommerce tetap sama antar request.
import { cookies } from 'next/headers';

import {
  SESSION_TOKEN_COOKIE,
  SESSION_TOKEN_MAX_AGE,
  baseCookieOptions,
} from '@/lib/auth/config';
import { getAuthToken } from '@/lib/auth/session';
import { getClient } from '@/lib/graphql-client';

type Variables = Record<string, unknown>;

/**
 * Request biasa tanpa sesi maupun auth. Dipakai untuk data publik
 * (katalog produk) supaya tidak ikut membuat sesi cart tanpa perlu.
 */
export async function publicRequest<T>(document: string, variables?: Variables): Promise<T> {
  return getClient().request<T>(document, variables);
}

/**
 * Request yang membawa identitas: token login (kalau ada) dan token sesi cart.
 *
 * WooGraphQL mengirim balik token sesi lewat response header
 * `woocommerce-session`. Token itu harus disimpan, kalau tidak setiap request
 * akan membuat cart baru dan isi keranjang selalu kosong.
 */
export async function identifiedRequest<T>(
  document: string,
  variables?: Variables,
): Promise<T> {
  const store = await cookies();
  const authToken = await getAuthToken();
  const sessionToken = store.get(SESSION_TOKEN_COOKIE)?.value ?? null;

  const response = await getClient({ authToken, sessionToken }).rawRequest<T>(
    document,
    variables,
  );

  const nextSessionToken = response.headers.get('woocommerce-session');

  if (nextSessionToken && nextSessionToken !== sessionToken) {
    try {
      store.set(SESSION_TOKEN_COOKIE, nextSessionToken, {
        ...baseCookieOptions,
        maxAge: SESSION_TOKEN_MAX_AGE,
      });
    } catch {
      // Server Component tidak boleh menulis cookie. Token baru terpakai untuk
      // request ini saja; Server Action berikutnya yang akan menyimpannya.
    }
  }

  return response.data;
}
