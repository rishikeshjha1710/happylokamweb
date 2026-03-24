'use client';

import { useQuery } from '@apollo/client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ME_QUERY } from '@/graphql/queries';
import { clearSession, getDashboardPathForRole, getStoredRole, isSessionRole, SessionRole } from '@/lib/auth';
import { PremiumLoader } from './dashboard-primitives';

type RoleGateProps = {
  requiredRole: SessionRole;
  children: ReactNode;
};

export function RoleGate({ requiredRole, children }: RoleGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'ready'>('checking');
  const role = getStoredRole();
  const { data, error, loading } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    skip: !isSessionRole(role)
  });

  useEffect(() => {
    if (!isSessionRole(role)) {
      setStatus('redirecting');
      router.replace('/login');
      return;
    }

    if (loading) {
      setStatus('checking');
      return;
    }

    if (error || !data?.me?.role) {
      clearSession();
      setStatus('redirecting');
      router.replace('/login');
      return;
    }

    if (!isSessionRole(data.me.role)) {
      clearSession();
      setStatus('redirecting');
      router.replace('/login');
      return;
    }

    if (data.me.role !== requiredRole) {
      setStatus('redirecting');
      router.replace(getDashboardPathForRole(data.me.role));
      return;
    }

    setStatus('ready');
  }, [data?.me?.role, error, loading, requiredRole, role, router]);

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="panel flex min-h-[320px] flex-col items-center justify-center text-center">
          <span className="pill">{status === 'checking' ? 'Preparing workspace' : 'Redirecting securely'}</span>
          <h1 className="mt-5 font-display text-3xl tracking-tight text-slate-950 md:text-4xl">
            Opening the right control surface for your account.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            We are validating your secure session and loading the protected dashboard assigned to this account.
          </p>
          <div className="mt-8">
            <PremiumLoader />
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
