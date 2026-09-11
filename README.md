# my-headless-store — Storefront Next.js

Storefront untuk toko WooCommerce headless. Semua data diambil dari WordPress
lewat GraphQL; frontend ini **tidak menghitung apa pun** — harga, ongkir, pajak,
dan stok semuanya keputusan WooCommerce.

Backend-nya ada di repo terpisah: `wordpress-api`.

```
Pembeli ──► Next.js (repo ini) ──GraphQL──► WordPress + WooCommerce
```

---

## Stack

| | Versi |
|---|---|
| Next.js | 16.3.4 (App Router, Turbopack) |
| React | 19.2.8 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| graphql-request | 7.4 |

---

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu sesuaikan isinya
npm run dev
```

Backend WordPress harus sudah hidup lebih dulu. Ikuti README di repo
`wordpress-api`.

### Variabel environment

Ketiganya wajib. Lihat `.env.example` untuk penjelasan tiap baris.

| Variabel | Dipakai di | Catatan |
|---|---|---|
| `NEXT_PUBLIC_WORDPRESS_URL` | `next.config.ts` | **Wajib saat build** |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | browser | Ikut ter-bundle |
| `WORDPRESS_API_URL` | server saja | Tidak pernah sampai ke browser |

> `NEXT_PUBLIC_WORDPRESS_URL` dipakai `next.config.ts` untuk menyusun
> `images.remotePatterns`. Kalau kosong, nilainya jatuh ke `localhost` —
> build tetap sukses tanpa error, tapi **semua gambar produk gagal tampil**.
> Ini jebakan paling sering saat deploy pertama.

---

## Peta route

| Route | Jenis | Fungsi |
|---|---|---|
| `/products` | Server Component | Daftar produk |
| `/products/[slug]` | Server Component | Detail + form tambah ke keranjang |
| `/cart` | Server Component | Keranjang, ubah jumlah, hapus item |
| `/checkout` | Server Component | Form alamat + pembayaran |
| `/checkout/selesai` | Server Component | Konfirmasi pesanan |
| `/login` | Server Component | Form login |
| `/account` | Server Component | Profil + riwayat pesanan |
| `/api/auth/login` | Route Handler | Tukar kredensial jadi cookie |
| `/api/auth/logout` | Route Handler | Hapus cookie |
| `/api/auth/me` | Route Handler | Cek sesi aktif |

---

## Cara auth bekerja

Tiga token disimpan sebagai **cookie httpOnly**. Tidak ada satu pun yang
dikembalikan dalam body JSON, dan tidak ada yang menyentuh `localStorage`.

| Cookie | Umur | Isi |
|---|---|---|
| `wp_auth_token` | 240 detik | JWT dari WordPress (aslinya 300 detik) |
| `wp_refresh_token` | 365 hari | Untuk menukar authToken baru |
| `wp_session_token` | 2 hari | Sesi keranjang WooCommerce |

`authToken` sengaja berumur pendek. `lib/auth/session.ts` menukarnya otomatis
lewat `refreshJwtAuthToken` saat kedaluwarsa, tanpa pengguna perlu login ulang.

### Keranjang tamu ikut pindah saat login

`app/api/auth/login/route.ts` mengirim `wp_session_token` milik tamu ke mutation
`login`. Tanpa ini, isi keranjang hilang begitu pengguna masuk.

---

## Keputusan desain yang perlu diketahui

**Client GraphQL adalah factory, bukan singleton.** `lib/graphql-client.ts`
membuat instance baru per pemanggilan. Singleton yang di-mutate akan
membocorkan token antar request di server.

**Session token WooCommerce berputar setiap request.** `lib/wp-request.ts`
membaca header `woocommerce-session` dari respons dan menyimpannya kembali ke
cookie. Ini inti dari keranjang headless — tanpa itu, keranjang kosong terus.

**Server Component tidak boleh menulis cookie.** Karena itu `store.set()` di
`lib/wp-request.ts` dibungkus `try/catch`. Ini keterbatasan Next.js, bukan bug.

**Checkout butuh 4 langkah berurutan.** WooCommerce menghitung ongkir dari
alamat di sesi, bukan dari yang diketik di form. `lib/checkout/actions.ts`
karenanya: simpan alamat → hitung ulang tarif → kunci metode pengiriman →
baru buat pesanan. Melewati langkah 3 menghasilkan error
*"No shipping method has been selected"*.

**`redirect()` bekerja dengan melempar exception**, jadi harus dipanggil di
**luar** `try/catch`.

**File `'use server'` hanya boleh mengekspor fungsi async.** Itu sebabnya ada
`action-state.ts` terpisah dari `actions.ts` di folder `cart/` dan `checkout/`.

---

## Deploy ke Vercel

Hanya repo ini yang ke Vercel. WordPress butuh PHP, MySQL, dan filesystem
persisten, jadi harus di VPS atau hosting PHP.

**1. Isi env var** di Vercel → Settings → Environment Variables. `.env.local`
tidak ikut ter-upload.

**2. Hapus `--use-system-ca` dari script `build` dan `start`.** Flag itu
tambalan untuk sertifikat lokal Laravel Herd yang tidak dipercaya Node. Di
Vercel flag ini tidak berguna dan berpotensi mengganggu `NODE_OPTIONS` bawaan:

```json
"dev": "cross-env NODE_OPTIONS=--use-system-ca next dev",
"build": "next build",
"start": "next start",
```

**3. Pastikan WordPress memakai HTTPS.** Halaman Vercel disajikan lewat HTTPS,
jadi gambar dari `http://...` akan diblokir browser sebagai mixed content.

Cookie sudah otomatis aman: `lib/auth/config.ts` menyetel
`secure: process.env.NODE_ENV === 'production'`. Karena cookie di-set oleh
Next.js sendiri (first-party), beda domain antara Vercel dan WordPress bukan
masalah — CORS tidak perlu diutak-atik.

> Paket **Hobby** Vercel melarang penggunaan komersial. Untuk toko sungguhan,
> perlu Pro.

---

## Batasan yang diketahui

- **Hanya produk simple.** Form tambah-ke-keranjang mengirim `productId` saja;
  produk *variable* butuh `variationId` yang belum ada
- **Belum ada caching.** Setiap kunjungan halaman produk menembak WordPress
- **Checkout terkunci satu negara** lewat `STORE_COUNTRY` di
  `lib/checkout/config.ts` — nilainya harus sama dengan basis toko WooCommerce
- **Baru satu gateway pembayaran** (COD)
- **Belum ada pagination** di daftar produk
- **Belum ada rate limiting** pada `/api/auth/login`
- **`app/page.tsx` masih template bawaan** create-next-app
- **Belum ada tes otomatis**

Urutan perbaikan yang paling berdampak: caching katalog → dukungan produk
variable → gateway pembayaran sungguhan.

---

## Perintah

```bash
npm run dev      # server pengembangan
npm run build    # build produksi
npm run start    # jalankan hasil build
npm run lint     # eslint
```
