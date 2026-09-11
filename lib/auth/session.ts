// lib/auth/session.ts
//
// Modul ini hanya untuk server. Pengaman alaminya adalah `next/headers`,
// yang akan melempar error kalau diimport dari Client Component.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '@/lib/graphql-client';
import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  SESSION_TOKEN_COOKIE,
  SESSION_TOKEN_MAX_AGE,
  baseCookieOptions,
} from './config';
import { describeGraphQLError } from './errors';
import {
  REFRESH_MUTATION,
  VIEWER_QUERY,
  type LoginPayload,
  type RefreshResponse,
  type ViewerResponse,
  type WpUser,
} from './queries';

/** Hanya boleh dipanggil dari Route Handler atau Server Action. */
export async function setAuthCookies(payload: LoginPayload): Promise<void> {
  const store = await cookies();

  if (payload.authToken) {
    store.set(AUTH_TOKEN_COOKIE, payload.authToken, {
      ...baseCookieOptions,
      maxAge: AUTH_TOKEN_MAX_AGE,
    });
  }

  if (payload.refreshToken) {
    store.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
      ...baseCookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  if (payload.sessionToken) {
    store.set(SESSION_TOKEN_COOKIE, payload.sessionToken, {
      ...baseCookieOptions,
      maxAge: SESSION_TOKEN_MAX_AGE,
    });
  }
}

/** Hanya boleh dipanggil dari Route Handler atau Server Action. */
export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(SESSION_TOKEN_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Mengembalikan authToken yang masih berlaku.
 *
 * authToken hanya hidup ~5 menit, jadi kalau cookie-nya sudah habis kita
 * tukar refreshToken (umur 365 hari) menjadi authToken baru.
 */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();

  const cached = store.get(AUTH_TOKEN_COOKIE)?.value;
  if (cached) return cached;

  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const data = await getClient().request<RefreshResponse>(REFRESH_MUTATION, {
      refreshToken,
    });

    const authToken = data.refreshJwtAuthToken?.authToken;
    if (!authToken) return null;

    try {
      store.set(AUTH_TOKEN_COOKIE, authToken, {
        ...baseCookieOptions,
        maxAge: AUTH_TOKEN_MAX_AGE,
      });
    } catch {
      // Server Component tidak boleh menulis cookie. Token tetap dipakai untuk
      // request ini; penyimpanannya menyusul saat Route Handler dipanggil.
    }

    return authToken;
  } catch (error) {
    console.error('[auth] gagal me-refresh authToken:', describeGraphQLError(error));
    return null;
  }
}

/** User yang sedang login, atau null kalau sesi tidak valid. */
export async function getViewer(): Promise<WpUser | null> {
  const authToken = await getAuthToken();
  if (!authToken) return null;

  try {
    const data = await getClient({ authToken }).request<ViewerResponse>(VIEWER_QUERY);
    return data.viewer ?? null;
  } catch (error) {
    console.error('[auth] gagal mengambil viewer:', describeGraphQLError(error));
    return null;
  }
}

/**
 * Dipakai di halaman yang wajib login.
 *
 * Pengecekan dilakukan di sini (dekat data), bukan di `proxy.ts`, sesuai
 * anjuran Next.js: proxy hanya untuk optimistic check, bukan otorisasi.
 */
export async function requireViewer(): Promise<WpUser> {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');
  return viewer;
}
