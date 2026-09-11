// lib/auth/config.ts

export const AUTH_TOKEN_COOKIE = 'wp_auth_token';
export const REFRESH_TOKEN_COOKIE = 'wp_refresh_token';
export const SESSION_TOKEN_COOKIE = 'wp_session_token';

/**
 * WPGraphQL JWT memberi authToken umur 300 detik (src/Auth.php:123).
 * Cookie dibuat sedikit lebih pendek supaya tidak sempat dipakai
 * saat token sebenarnya sudah kedaluwarsa di sisi WordPress.
 */
export const AUTH_TOKEN_MAX_AGE = 240;

/** refreshToken berumur 365 hari (src/Auth.php:346). Ini sumber kebenaran sesi. */
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 365;

/** Sesi cart WooCommerce, mengikuti default WC (48 jam). */
export const SESSION_TOKEN_MAX_AGE = 60 * 60 * 24 * 2;

/**
 * httpOnly  : token tidak bisa dibaca JavaScript (mitigasi XSS).
 * sameSite  : 'lax' menahan cookie pada POST lintas situs (mitigasi CSRF).
 * secure    : dimatikan saat dev karena `next dev` berjalan di http://localhost.
 */
export const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
} as const;
