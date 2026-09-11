'use client';

import { useActionState } from 'react';

import { initialCartActionState } from '@/lib/cart/action-state';
import { addToCartAction } from '@/lib/cart/actions';

export function AddToCartForm({
  productId,
  disabled,
}: {
  productId: number;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    initialCartActionState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />

      <label className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Jumlah</span>
        <input
          type="number"
          name="quantity"
          defaultValue={1}
          min={1}
          className="w-20 rounded-md border border-black/15 px-2 py-1 dark:border-white/20 dark:bg-black"
        />
      </label>

      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {pending ? 'Menambahkan…' : 'Tambah ke keranjang'}
      </button>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Ditambahkan ke keranjang.
        </p>
      ) : null}
    </form>
  );
}
