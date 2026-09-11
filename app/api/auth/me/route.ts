import { NextResponse } from 'next/server';

import { getViewer } from '@/lib/auth/session';

export async function GET() {
  const user = await getViewer();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
