import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_TOKEN_COOKIE } from '@/lib/auth/config';
import { getClient } from '@/lib/graphql-client';
import { describeGraphQLError, toPublicErrorMessage } from '@/lib/auth/errors';
import { LOGIN_MUTATION, type LoginResponse } from '@/lib/auth/queries';
import { setAuthCookies } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body harus berupa JSON.' }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json(
      { error: 'username dan password wajib diisi.' },
      { status: 400 },
    );
  }

  // Kirim sesi cart milik guest supaya isi keranjang sebelum login ikut
  // berpindah ke akun. Tanpa ini WooCommerce memberi sesi baru yang kosong.
  const guestSessionToken = (await cookies()).get(SESSION_TOKEN_COOKIE)?.value ?? null;

  try {
    const data = await getClient({ sessionToken: guestSessionToken }).request<LoginResponse>(
      LOGIN_MUTATION,
      { username, password },
    );

    const payload = data.login;

    if (!payload?.authToken || !payload.refreshToken) {
      return NextResponse.json({ error: 'Login gagal.' }, { status: 401 });
    }

    await setAuthCookies(payload);

    // Token sengaja tidak ikut di response body: biar tetap httpOnly
    // dan tidak pernah tersentuh JavaScript di browser.
    return NextResponse.json({ user: payload.user });
  } catch (error) {
    console.error('[auth/login] gagal:', describeGraphQLError(error));
    return NextResponse.json(
      { error: toPublicErrorMessage(error, 'Username atau password salah.') },
      { status: 401 },
    );
  }
}
