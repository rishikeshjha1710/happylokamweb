import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = {
  title: 'Login',
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-20 text-sm text-slate-500">Loading secure login...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
