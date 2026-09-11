import Link from 'next/link';
import { Suspense } from 'react';

import { getViewer } from '@/lib/auth/session';
import { getCart } from '@/lib/cart/data';

async function CartCount() {
  const cart = await getCart();
  const count = cart?.contents?.itemCount ?? 0;

  if (count === 0) return null;

  return (
    <span className="ml-1 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
      {count}
    </span>
  );
}

async function AccountLink() {
  const viewer = await getViewer();

  return viewer ? (
    <Link href="/account" className="hover:underline underline-offset-4">
      {viewer.name ?? 'Akun'}
    </Link>
  ) : (
    <Link href="/login" className="hover:underline underline-offset-4">
      Masuk
    </Link>
  );
}

/**
 * Bagian yang bergantung pada cookie dibungkus Suspense supaya kerangka
 * halaman tetap bisa dikirim lebih dulu, tidak menunggu WordPress.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
        <Link href="/products" className="font-semibold">
          Toko
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline underline-offset-4">
            Produk
          </Link>

          <Link href="/cart" className="flex items-center hover:underline underline-offset-4">
            Keranjang
            <Suspense fallback={null}>
              <CartCount />
            </Suspense>
          </Link>

          <Suspense fallback={null}>
            <AccountLink />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
