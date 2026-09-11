// lib/orders/data.ts
import { describeGraphQLError } from '@/lib/auth/errors';
import { identifiedRequest } from '@/lib/wp-request';

import { MY_ORDERS_QUERY, type MyOrders, type MyOrdersResponse } from './queries';

const EMPTY: MyOrders = { orderCount: 0, totalSpent: 0, orders: [] };

/**
 * Riwayat pesanan milik user yang sedang login.
 *
 * `customer` mengikuti identitas pada header Authorization; tanpa login
 * WooCommerce mengembalikan customer tamu yang riwayatnya kosong.
 */
export async function getMyOrders(first = 20): Promise<MyOrders> {
  try {
    const data = await identifiedRequest<MyOrdersResponse>(MY_ORDERS_QUERY, { first });
    const customer = data.customer;

    return {
      orderCount: customer?.orderCount ?? 0,
      totalSpent: customer?.totalSpent ?? 0,
      orders: customer?.orders?.nodes ?? [],
    };
  } catch (error) {
    console.error('[orders] gagal mengambil riwayat:', describeGraphQLError(error));
    return EMPTY;
  }
}
