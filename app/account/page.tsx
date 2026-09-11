import Link from 'next/link';

import { requireViewer } from '@/lib/auth/session';
import { getMyOrders } from '@/lib/orders/data';

import { LogoutButton } from './logout-button';

export const metadata = { title: 'Akun' };

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu pembayaran',
  PROCESSING: 'Diproses',
  ON_HOLD: 'Ditahan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  REFUNDED: 'Dikembalikan',
  FAILED: 'Gagal',
};

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

export default async function AccountPage() {
  // Melempar redirect ke /login kalau sesi tidak valid.
  const user = await requireViewer();
  const { orders, orderCount } = await getMyOrders();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 p-6">
      <section className="space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/15">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{user.name ?? user.username}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email ?? '-'}</p>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Riwayat pesanan{orderCount ? ` (${orderCount})` : ''}
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Belum ada pesanan.{' '}
            <Link href="/products" className="underline underline-offset-4">
              Mulai belanja
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.databaseId}
                className="rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">#{order.orderNumber}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(order.date)}
                  </span>
                </div>

                <ul className="mt-2 space-y-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {(order.lineItems?.nodes ?? []).map((item, index) => (
                    <li key={index}>
                      {item.product?.node?.name ?? 'Produk'} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="rounded-full border border-black/15 px-2 py-0.5 dark:border-white/20">
                    {STATUS_LABEL[order.status ?? ''] ?? order.status}
                  </span>
                  <span>
                    {order.paymentMethodTitle} · <strong>{order.total}</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
