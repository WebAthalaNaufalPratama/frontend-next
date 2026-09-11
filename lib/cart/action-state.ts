// lib/cart/action-state.ts
//
// Dipisah dari actions.ts karena file ber-'use server' hanya boleh
// mengekspor fungsi async — objek biasa akan ditolak Next.js.

export type CartActionState = { ok: boolean; error: string | null };

export const initialCartActionState: CartActionState = { ok: false, error: null };
