import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-20 text-sm text-slate-500">Loading secure login...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
