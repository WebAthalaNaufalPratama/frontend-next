import Image from 'next/image';
import Link from 'next/link';

import type { ProductListItem } from '@/lib/products/queries';

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
    >
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
        {product.image?.sourceUrl ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText ?? product.name ?? ''}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h2 className="text-sm font-medium">{product.name}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {product.price ?? 'Harga belum diatur'}
        </p>
      </div>
    </Link>
  );
}
