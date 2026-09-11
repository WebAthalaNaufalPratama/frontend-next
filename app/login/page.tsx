'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? 'Login gagal.');
      setPending(false);
      return;
    }

    // refresh() supaya Server Component membaca ulang cookie sesi yang baru.
    router.replace('/account');
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/15"
      >
        <h1 className="text-xl font-semibold">Masuk</h1>

        <label className="block space-y-1">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>

        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {pending ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}
