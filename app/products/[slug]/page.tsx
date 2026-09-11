import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getProductBySlug } from '@/lib/products/data';

import { AddToCartForm } from './add-to-cart-form';

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const outOfStock = product.stockStatus === 'OUT_OF_STOCK';

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <Link href="/products" className="text-sm underline underline-offset-4">
        ← Semua produk
      </Link>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          {product.image?.sourceUrl ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText ?? product.name ?? ''}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-xl">{product.price ?? 'Harga belum diatur'}</p>

          {product.shortDescription ? (
            <div
              className="prose-sm text-zinc-600 dark:text-zinc-400"
              // Konten dari editor WordPress memang berupa HTML.
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          ) : null}

          {outOfStock ? (
            <p className="text-sm text-red-600 dark:text-red-400">Stok habis.</p>
          ) : null}

          {product.purchasable ? (
            <AddToCartForm productId={product.databaseId} disabled={outOfStock} />
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Produk ini tidak bisa dibeli langsung.
            </p>
          )}

          {product.sku ? (
            <p className="text-xs text-zinc-500">SKU: {product.sku}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
