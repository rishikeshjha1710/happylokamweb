import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-20 text-sm text-slate-500">Loading secure signup...</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
