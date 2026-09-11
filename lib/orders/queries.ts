// lib/orders/queries.ts

export type OrderLineItem = {
  quantity: number | null;
  total: string | null;
  product: { node: { name: string | null; slug: string | null } | null } | null;
};

export type MyOrder = {
  databaseId: number;
  orderNumber: string | null;
  date: string | null;
  status: string | null;
  total: string | null;
  paymentMethodTitle: string | null;
  lineItems: { nodes: OrderLineItem[] } | null;
};

export type MyOrders = {
  orderCount: number | null;
  totalSpent: number | null;
  orders: MyOrder[];
};

export type MyOrdersResponse = {
  customer: {
    databaseId: number | null;
    orderCount: number | null;
    totalSpent: number | null;
    orders: { nodes: MyOrder[] } | null;
  } | null;
};

export const MY_ORDERS_QUERY = /* GraphQL */ `
  query MyOrders($first: Int!) {
    customer {
      databaseId
      orderCount
      totalSpent
      orders(first: $first) {
        nodes {
          databaseId
          orderNumber
          date
          status
          total
          paymentMethodTitle
          lineItems {
            nodes {
              quantity
              total
              product {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  }
`;
