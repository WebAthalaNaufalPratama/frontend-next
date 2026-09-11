// lib/auth/errors.ts
import { ClientError } from 'graphql-request';

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&nbsp;': ' ',
};

/**
 * WordPress mengembalikan pesan error ber-HTML dan ter-escape, mis.
 * "&lt;strong&gt;Eror&lt;/strong&gt;: Nama pengguna ... tidak terdaftar".
 * Decode dulu, baru buang tag-nya.
 */
function toPlainText(message: string): string {
  return message
    .replace(/&(amp|lt|gt|quot|#039|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pesan asli dari WordPress, untuk dicatat di log server. */
export function describeGraphQLError(error: unknown): string {
  if (error instanceof ClientError) {
    const messages = error.response?.errors?.map((e) => e.message) ?? [];
    if (messages.length > 0) return messages.map(toPlainText).join(' | ');
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * Pesan yang boleh dilihat pengguna.
 *
 * Di produksi selalu pakai `fallback` yang generik: pesan asli WordPress
 * membedakan "username tidak terdaftar" dan "password salah", sehingga bisa
 * dipakai untuk menebak-nebak akun mana yang ada (user enumeration).
 */
export function toPublicErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === 'production') return fallback;
  const detail = describeGraphQLError(error);
  return detail || fallback;
}
