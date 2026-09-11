// lib/cart/queries.ts

export type CartProduct = {
  id: string;
  databaseId: number;
  name: string | null;
  slug: string | null;
  price: string | null;
  image: { sourceUrl: string | null; altText: string | null } | null;
};

export type CartItem = {
  key: string;
  quantity: number | null;
  total: string | null;
  product: { node: CartProduct } | null;
};

export type Cart = {
  isEmpty: boolean | null;
  subtotal: string | null;
  total: string | null;
  contents: { itemCount: number | null; nodes: CartItem[] } | null;
};

export type CartResponse = { cart: Cart | null };

export const CART_QUERY = /* GraphQL */ `
  query Cart {
    cart {
      isEmpty
      subtotal
      total
      contents {
        itemCount
        nodes {
          key
          quantity
          total
          product {
            node {
              id
              databaseId
              name
              slug
              image {
                sourceUrl
                altText
              }
              ... on ProductWithPricing {
                price
              }
            }
          }
        }
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = /* GraphQL */ `
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(input: { productId: $productId, quantity: $quantity }) {
      cartItem {
        key
        quantity
      }
    }
  }
`;

export const UPDATE_QUANTITY_MUTATION = /* GraphQL */ `
  mutation UpdateQuantity($items: [CartItemQuantityInput]!) {
    updateItemQuantities(input: { items: $items }) {
      cart {
        contents {
          itemCount
        }
      }
    }
  }
`;

export const REMOVE_ITEMS_MUTATION = /* GraphQL */ `
  mutation RemoveItems($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        contents {
          itemCount
        }
      }
    }
  }
`;
