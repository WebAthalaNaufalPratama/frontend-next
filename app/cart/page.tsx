import Image from 'next/image';
import Link from 'next/link';

import { removeItemAction, updateQuantityAction } from '@/lib/cart/actions';
import { getCart } from '@/lib/cart/data';

export const metadata = { title: 'Keranjang' };

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.contents?.nodes ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Keranjang</h1>
        <Link href="/products" className="text-sm underline underline-offset-4">
          Lanjut belanja
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">Keranjang masih kosong.</p>
      ) : (
        <>
          <ul className="divide-y divide-black/10 dark:divide-white/15">
            {items.map((item) => {
              const product = item.product?.node;

              return (
                <li key={item.key} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                    {product?.image?.sourceUrl ? (
                      <Image
                        src={product.image.sourceUrl}
                        alt={product.image.altText ?? product.name ?? ''}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{product?.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.total}</p>
                  </div>

                  <form action={updateQuantityAction} className="flex items-center gap-2">
                    <input type="hidden" name="key" value={item.key} />
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={item.quantity ?? 1}
                      min={1}
                      className="w-16 rounded-md border border-black/15 px-2 py-1 dark:border-white/20 dark:bg-black"
                    />
                    <button type="submit" className="text-sm underline underline-offset-4">
                      Ubah
                    </button>
                  </form>

                  <form action={removeItemAction}>
                    <input type="hidden" name="key" value={item.key} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 underline underline-offset-4 dark:text-red-400"
                    >
                      Hapus
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Subtotal</dt>
              <dd>{cart?.subtotal}</dd>
            </div>
            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd>{cart?.total}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-2 text-background"
          >
            Lanjut ke checkout
          </Link>
        </>
      )}
    </main>
  );
}
