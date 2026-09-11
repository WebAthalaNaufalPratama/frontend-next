// lib/graphql-client.ts
import { GraphQLClient } from 'graphql-request';

export type ClientAuth = {
  /** JWT dari mutation `login` / `refreshJwtAuthToken`. */
  authToken?: string | null;
  /** Token sesi WooCommerce, untuk cart milik user/guest. */
  sessionToken?: string | null;
};

/**
 * Endpoint dibaca lazy (bukan di top-level module) supaya import dari
 * Client Component atau saat `next build` tidak langsung melempar error.
 *
 * WORDPRESS_API_URL didahulukan karena tidak ikut ter-bundle ke browser.
 */
function getEndpoint(): string {
  const endpoint =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  if (!endpoint) {
    throw new Error(
      'WORDPRESS_API_URL (atau NEXT_PUBLIC_WORDPRESS_API_URL) belum diatur di .env.local',
    );
  }

  return endpoint;
}

/**
 * Selalu buat instance baru per pemanggilan.
 *
 * Jangan pakai singleton yang di-mutate: di server satu instance dipakai
 * bersama lintas request, sehingga header Authorization milik satu user
 * bisa bocor ke request user lain.
 */
export function getClient(auth: ClientAuth = {}): GraphQLClient {
  const headers: Record<string, string> = {};

  if (auth.authToken) {
    headers.Authorization = `Bearer ${auth.authToken}`;
  }

  // Format header dibaca WooGraphQL di class-ql-session-handler.php:271
  if (auth.sessionToken) {
    headers['woocommerce-session'] = `Session ${auth.sessionToken}`;
  }

  return new GraphQLClient(getEndpoint(), { headers });
}
