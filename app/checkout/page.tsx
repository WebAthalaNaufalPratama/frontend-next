import Link from 'next/link';

import { getCheckoutOptions } from '@/lib/checkout/data';

import { CheckoutForm } from './checkout-form';

export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const options = await getCheckoutOptions();

  if (options.cartIsEmpty) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Keranjang masih kosong.{' '}
          <Link href="/products" className="underline underline-offset-4">
            Pilih produk dulu
          </Link>
        </p>
      </main>
    );
  }

  if (options.gateways.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
        <p className="text-red-600 dark:text-red-400">
          Belum ada metode pembayaran aktif. Aktifkan salah satu di WooCommerce → Settings →
          Payments.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Link href="/cart" className="text-sm underline underline-offset-4">
          Kembali ke keranjang
        </Link>
      </div>

      <CheckoutForm
        gateways={options.gateways}
        states={options.states}
        rates={options.rates}
        cartTotal={options.cartTotal}
      />
    </main>
  );
}
