// lib/checkout/config.ts

/**
 * Negara asal toko. Harus sama dengan "base country" di
 * WooCommerce → Settings → General, karena dipakai untuk mengambil
 * daftar provinsi dan dikirim sebagai CountriesEnum saat checkout.
 *
 * Checkout lintas negara belum didukung: form ini mengunci satu negara
 * supaya daftar provinsinya pasti cocok. Untuk membukanya, jadikan negara
 * sebagai input dan ambil ulang `countryStates` setiap negara berubah.
 */
export const STORE_COUNTRY = 'ID';

/**
 * Ringkasan pesanan terakhir dititipkan lewat cookie singkat, bukan query
 * string, supaya nomor pesanan tidak bisa dikarang lewat URL.
 */
export const LAST_ORDER_COOKIE = 'wp_last_order';
export const LAST_ORDER_MAX_AGE = 60 * 10;
