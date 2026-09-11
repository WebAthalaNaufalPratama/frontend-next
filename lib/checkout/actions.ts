'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { baseCookieOptions } from '@/lib/auth/config';
import { describeGraphQLError, toPublicErrorMessage } from '@/lib/auth/errors';
import { identifiedRequest } from '@/lib/wp-request';

import type { CheckoutActionState } from './action-state';
import { LAST_ORDER_COOKIE, LAST_ORDER_MAX_AGE, STORE_COUNTRY } from './config';
import {
  CHECKOUT_MUTATION,
  SHIPPING_RATES_QUERY,
  UPDATE_CUSTOMER_MUTATION,
  UPDATE_SHIPPING_METHOD_MUTATION,
  type CheckoutResponse,
  type PlacedOrder,
  type ShippingRatesResponse,
} from './queries';

const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address1',
  'city',
  'state',
  'postcode',
] as const;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function fail(error: string): CheckoutActionState {
  return { ok: false, error, order: null };
}

export async function checkoutAction(
  _previous: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const billing: Record<string, string> = {};

  for (const field of REQUIRED_FIELDS) {
    const value = readString(formData, field);
    if (!value) return fail('Semua kolom alamat wajib diisi.');
    billing[field] = value;
  }

  if (!billing.email.includes('@')) return fail('Format email tidak valid.');

  const paymentMethod = readString(formData, 'paymentMethod');
  if (!paymentMethod) return fail('Pilih metode pembayaran.');

  const address = { ...billing, country: STORE_COUNTRY };
  const preferredRate = readString(formData, 'shippingMethod');

  let order: PlacedOrder;

  try {
    // 1. Simpan alamat ke sesi lebih dulu. Tanpa ini WooCommerce menghitung
    //    ongkir memakai alamat dasar toko, bukan tujuan yang diisi pembeli.
    await identifiedRequest(UPDATE_CUSTOMER_MUTATION, { address });

    // 2. Hitung ulang ongkir untuk alamat tersebut.
    const shippingData = await identifiedRequest<ShippingRatesResponse>(SHIPPING_RATES_QUERY);
    const needsShipping = shippingData.cart?.needsShippingAddress ?? false;
    const rates = (shippingData.cart?.availableShippingMethods ?? []).flatMap(
      (method) => method.rates ?? [],
    );

    let chosenRate: string | null = null;

    if (needsShipping) {
      if (rates.length === 0) {
        return fail(
          'Tidak ada opsi pengiriman untuk alamat ini. Periksa kembali provinsi dan kode pos, ' +
            'atau tambahkan zona pengiriman yang mencakup wilayah tersebut di WooCommerce.',
        );
      }

      // Pilihan dari form dipakai kalau masih berlaku; kalau halaman sudah usang,
      // jatuh ke tarif pertama yang tersedia untuk alamat baru.
      chosenRate = rates.some((rate) => rate.id === preferredRate) ? preferredRate : rates[0].id;

      // 3. Kunci metode pengiriman di sesi. Inilah yang dicek WooCommerce dan
      //    memicu "No shipping method has been selected" kalau kosong.
      await identifiedRequest(UPDATE_SHIPPING_METHOD_MUTATION, { methods: [chosenRate] });
    }

    // 4. Baru buat pesanan.
    const data = await identifiedRequest<CheckoutResponse>(CHECKOUT_MUTATION, {
      input: {
        paymentMethod,
        billing: address,
        ...(chosenRate ? { shippingMethod: [chosenRate] } : {}),
      },
    });

    if (data.checkout?.result !== 'success' || !data.checkout.order) {
      return fail('Checkout gagal diproses.');
    }

    order = data.checkout.order;

    // Titipkan ringkasan untuk halaman konfirmasi.
    (await cookies()).set(LAST_ORDER_COOKIE, JSON.stringify(order), {
      ...baseCookieOptions,
      maxAge: LAST_ORDER_MAX_AGE,
    });

    // Cart dikosongkan WooCommerce setelah order dibuat.
    revalidatePath('/cart');
    revalidatePath('/products');
  } catch (error) {
    console.error('[checkout] gagal:', describeGraphQLError(error));
    return fail(toPublicErrorMessage(error, 'Checkout gagal diproses.'));
  }

  // redirect() bekerja dengan melempar, jadi harus di luar try/catch di atas —
  // kalau tidak, catch akan menelannya dan pengalihan tidak pernah terjadi.
  //
  // Pengalihan ini juga yang memperbaiki bug utamanya: setelah Server Action,
  // Next merender ulang route yang aktif. Cart sudah kosong, jadi halaman
  // /checkout akan menampilkan "Keranjang masih kosong" dan mengganti form
  // beserta panel konfirmasinya.
  redirect('/checkout/selesai');
}
