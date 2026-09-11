'use client';

import { useActionState } from 'react';

import { initialCheckoutState } from '@/lib/checkout/action-state';
import { checkoutAction } from '@/lib/checkout/actions';
import type { CountryState, PaymentGateway, ShippingRate } from '@/lib/checkout/queries';

const FIELD_CLASS =
  'w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-black';

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <input type={type} name={name} autoComplete={autoComplete} required className={FIELD_CLASS} />
    </label>
  );
}

export function CheckoutForm({
  gateways,
  states,
  rates,
  cartTotal,
}: {
  gateways: PaymentGateway[];
  states: CountryState[];
  rates: ShippingRate[];
  cartTotal: string | null;
}) {
  const [state, formAction, pending] = useActionState(checkoutAction, initialCheckoutState);

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-medium">Alamat penagihan</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama depan" name="firstName" autoComplete="given-name" />
          <Field label="Nama belakang" name="lastName" autoComplete="family-name" />
        </div>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Telepon" name="phone" type="tel" autoComplete="tel" />
        <Field label="Alamat" name="address1" autoComplete="street-address" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kota" name="city" autoComplete="address-level2" />
          <Field label="Kode pos" name="postcode" autoComplete="postal-code" />
        </div>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Provinsi</span>
          <select name="state" required defaultValue="" className={FIELD_CLASS}>
            <option value="" disabled>
              Pilih provinsi
            </option>
            {states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {rates.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-medium">Pengiriman</h2>
          {rates.map((rate, index) => (
            <label key={rate.id} className="flex items-center gap-2 text-sm">
              <input type="radio" name="shippingMethod" value={rate.id} defaultChecked={index === 0} />
              <span>
                {rate.label} — {rate.cost}
              </span>
            </label>
          ))}
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-medium">Pembayaran</h2>
        {gateways.map((gateway, index) => (
          <label key={gateway.id} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value={gateway.id}
              defaultChecked={index === 0}
              className="mt-1"
            />
            <span>
              <span className="block">{gateway.title}</span>
              {gateway.description ? (
                <span className="block text-zinc-600 dark:text-zinc-400">{gateway.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </section>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/15">
        <span className="font-medium">Total {cartTotal}</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
        >
          {pending ? 'Memproses…' : 'Buat pesanan'}
        </button>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
