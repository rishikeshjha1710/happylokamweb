'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardPathForRole, readStoredSession } from '@/lib/auth';

export function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const session = readStoredSession();

    if (!session.role) {
      router.replace('/login');
      return;
    }

    router.replace(getDashboardPathForRole(session.role));
  }, [router]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="panel flex min-h-[320px] flex-col items-center justify-center text-center">
        <span className="pill">Routing workspace</span>
        <h1 className="mt-5 font-display text-3xl tracking-tight text-slate-950 md:text-4xl">
          Taking you to your dashboard.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
          Your saved role decides whether you land in the user profile workspace, vendor operating console, or admin control room.
        </p>
      </div>
    </section>
  );
}
