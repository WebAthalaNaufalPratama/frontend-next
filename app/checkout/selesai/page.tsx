import Link from 'next/link';
import { cookies } from 'next/headers';

import { LAST_ORDER_COOKIE } from '@/lib/checkout/config';
import type { PlacedOrder } from '@/lib/checkout/queries';

export const metadata = { title: 'Pesanan diterima' };

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu pembayaran',
  PROCESSING: 'Diproses',
  ON_HOLD: 'Ditahan',
  COMPLETED: 'Selesai',
};

async function readLastOrder(): Promise<PlacedOrder | null> {
  const raw = (await cookies()).get(LAST_ORDER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PlacedOrder;
  } catch {
    return null;
  }
}

export default async function CheckoutDonePage() {
  const order = await readLastOrder();

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <h1 className="mb-4 text-2xl font-semibold">Pesanan</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tidak ada pesanan terbaru untuk ditampilkan.{' '}
          <Link href="/account" className="underline underline-offset-4">
            Lihat riwayat pesanan
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <div className="space-y-4 rounded-xl border border-green-600/40 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Pesanan diterima</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Terima kasih, pesananmu sudah kami catat.
          </p>
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-600 dark:text-zinc-400">Nomor pesanan</dt>
            <dd>#{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-600 dark:text-zinc-400">Status</dt>
            <dd>{STATUS_LABEL[order.status ?? ''] ?? order.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-600 dark:text-zinc-400">Pembayaran</dt>
            <dd>{order.paymentMethodTitle}</dd>
          </div>
          <div className="flex justify-between text-base font-medium">
            <dt>Total</dt>
            <dd>{order.total}</dd>
          </div>
        </dl>

        <div className="flex gap-4 text-sm">
          <Link href="/products" className="underline underline-offset-4">
            Belanja lagi
          </Link>
          <Link href="/account" className="underline underline-offset-4">
            Riwayat pesanan
          </Link>
        </div>
      </div>
    </main>
  );
}
