// lib/products/queries.ts

export type ProductImage = {
  sourceUrl: string | null;
  altText: string | null;
} | null;

export type ProductListItem = {
  id: string;
  databaseId: number;
  name: string | null;
  slug: string | null;
  type: string | null;
  onSale: boolean | null;
  purchasable: boolean | null;
  /** Sudah diformat mata uang oleh WooCommerce, mis. "Rp150.000". */
  price: string | null;
  regularPrice: string | null;
  image: ProductImage;
};

export type ProductDetail = ProductListItem & {
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  stockStatus: string | null;
};

export type ProductsResponse = { products: { nodes: ProductListItem[] } };
export type ProductResponse = { product: ProductDetail | null };

/**
 * `price` ada di interface ProductWithPricing, bukan di interface Product,
 * jadi harus lewat inline fragment. GroupProduct memang tidak punya harga.
 */
const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    databaseId
    name
    slug
    type
    onSale
    purchasable
    image {
      sourceUrl
      altText
    }
    ... on ProductWithPricing {
      price
      regularPrice
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Products($first: Int!) {
    products(first: $first, where: { status: "publish" }) {
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query ProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ...ProductFields
      sku
      description
      shortDescription
      ... on InventoriedProduct {
        stockStatus
      }
    }
  }
`;
