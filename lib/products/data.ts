// lib/products/data.ts
import { describeGraphQLError } from '@/lib/auth/errors';
import { publicRequest } from '@/lib/wp-request';

import {
  PRODUCTS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  type ProductDetail,
  type ProductListItem,
  type ProductResponse,
  type ProductsResponse,
} from './queries';

export async function getProducts(first = 24): Promise<ProductListItem[]> {
  const data = await publicRequest<ProductsResponse>(PRODUCTS_QUERY, { first });
  return data.products?.nodes ?? [];
}

/**
 * WooGraphQL melempar error (bukan mengembalikan null) kalau slug tidak ada,
 * jadi kegagalan diterjemahkan menjadi null supaya pemanggil bisa notFound().
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const data = await publicRequest<ProductResponse>(PRODUCT_BY_SLUG_QUERY, { slug });
    return data.product ?? null;
  } catch (error) {
    console.error(`[products] slug "${slug}" tidak terambil:`, describeGraphQLError(error));
    return null;
  }
}
