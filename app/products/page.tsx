import Link from 'next/link';

import { getProducts } from '@/lib/products/data';

import { ProductCard } from './product-card';

export const metadata = { title: 'Produk' };

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produk</h1>
        <Link href="/cart" className="text-sm underline underline-offset-4">
          Keranjang
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Belum ada produk. Tambahkan lewat WooCommerce, atau import sample data
          dari <code>wp-content/plugins/woocommerce/sample-data/sample_products.csv</code>.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
