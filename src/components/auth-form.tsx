'use client';

import { useMutation } from '@apollo/client';
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/graphql/queries';
import { getDashboardPathForRole, normalizeSessionRole, persistSession } from '@/lib/auth';

import { PremiumAlert, PremiumLoader } from './dashboard-primitives';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const requestedRole = normalizeSessionRole(searchParams.get('role'));
  const authRole =
    requestedRole === 'ADMIN'
      ? mode === 'login'
        ? 'ADMIN'
        : 'USER'
      : requestedRole === 'PARTNER'
        ? 'PARTNER'
        : 'USER';

  const [form, setForm] = useState({
    fullName: '',
    identifier: '',
    username: '',
    password: '',
    role: authRole,
    businessName: '',
    city: '',
    state: ''
  });
  const [errorDetails, setErrorDetails] = useState<{ title: string; copy: string } | null>(null);
  const [successDetails, setSuccessDetails] = useState<{ title: string; copy: string } | null>(null);

  const [login, loginState] = useMutation(LOGIN_MUTATION);
  const [register, registerState] = useMutation(REGISTER_MUTATION);

  const loading = loginState.loading || registerState.loading || isPending;
  const isPartner = form.role === 'PARTNER';

  useEffect(() => {
    setForm((current) => (current.role === authRole ? current : { ...current, role: authRole }));
  }, [authRole]);

  useEffect(() => {
    setIsSessionReady(true);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorDetails(null);

    try {
      if (mode === 'login') {
        const result = await login({
          variables: {
            input: {
              identifier: form.identifier,
              password: form.password
            }
          }
        });

        const payload = result.data?.login;
        if (!payload?.accessToken || !payload?.user?.role) {
          throw new Error('Something went wrong during login.');
        }

        persistSession(payload.accessToken, payload.user.role);
        setSuccessDetails({
          title: 'Welcome Back!',
          copy: 'Your secure session has been established. Redirecting to your workspace...'
        });

        setTimeout(() => {
          startTransition(() => {
            router.replace(getDashboardPathForRole(payload.user.role));
          });
        }, 2000);
        return;
      }

        const result = await register({
          variables: {
            input: {
              fullName: form.fullName,
              email: form.identifier,
              username: form.username || undefined,
              password: form.password,
              role: form.role === 'PARTNER' ? 'VENDOR' : form.role,
              businessName: isPartner ? form.businessName : undefined,
              city: isPartner ? form.city : undefined,
              state: isPartner ? form.state : undefined
            }
          }
        });

      const payload = result.data?.register;
      if (!payload?.accessToken || !payload?.user?.role) {
        throw new Error('Something went wrong during account creation.');
      }

      persistSession(payload.accessToken, payload.user.role);
      setSuccessDetails({
        title: 'Account Created!',
      copy: 'Welcome to the happylokam family. Your celebration journey starts now.'
      });

      setTimeout(() => {
        startTransition(() => {
          router.replace(getDashboardPathForRole(payload.user.role));
        });
      }, 2000);
    } catch (error) {
      setErrorDetails({
        title: 'Authentication Update',
        copy: error instanceof Error ? error.message : 'Please check your information and try again.'
      });
    }
  }

  if (!isSessionReady) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="panel flex min-h-[420px] flex-col items-center justify-center text-center">
          <span className="pill">Preparing your experience</span>
          <h1 className="mt-5 break-words font-display text-2xl tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
            Checking your safe workspace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            If you are already part of the happylokam family, you will be redirected to your personal dashboard automatically.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      {errorDetails && (
        <PremiumAlert
          type="error"
          title={errorDetails.title}
          message={errorDetails.copy}
          onClose={() => setErrorDetails(null)}
        />
      )}
      {successDetails && (
        <PremiumAlert
          type="success"
          title={successDetails.title}
          message={successDetails.copy}
          onClose={() => setSuccessDetails(null)}
        />
      )}
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden rounded-[36px] border border-rose-200/70 bg-[linear-gradient(135deg,#020617,#be123c)] p-8 text-white shadow-[0_30px_120px_rgba(225,29,72,0.22)] md:p-12 lg:block">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px]" />
          <div className="relative">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
              {mode === 'login'
                ? form.role === 'ADMIN'
                  ? 'Admin Access'
                  : form.role === 'PARTNER'
                    ? 'Partner Access'
                    : 'Secure Authentication'
                : form.role === 'PARTNER'
                  ? 'Partner Membership'
                  : 'User Membership'}
            </span>
            <h1 className="mt-8 break-words font-display text-3xl tracking-tight leading-[1.08] sm:text-4xl md:text-6xl">
              {mode === 'login'
                ? form.role === 'ADMIN'
                  ? 'Access the protected admin control center.'
                  : form.role === 'PARTNER'
                    ? 'Access your partner operations desk.'
                    : 'Access your celebration command center.'
                : form.role === 'PARTNER'
                  ? 'Create your partner account.'
                  : 'Create your celebration account.'}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/70">
              happylokam is the world&apos;s most trusted celebration network. From intimate gatherings to grand festivals, we bridge the gap between vision and execution.
            </p>
            <div className="mt-12 grid gap-4">
              {[
                { title: 'Verified Identity', desc: 'Secure sessions protected by MCA-level protocols.' },
                { title: 'Global Discovery', desc: 'Access elite partners and premium celebration services.' },
                { title: 'Operational Ease', desc: 'Manage bookings, payments, and schedules in one room.' }
              ].map((item, index) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold text-white/90">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/60">{item.desc}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel mx-auto flex w-full max-w-xl flex-col justify-center border-rose-100 bg-white/80 backdrop-blur-md lg:max-w-none">
          <div className="mb-10 text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-600">
              {mode === 'login'
                ? form.role === 'ADMIN'
                  ? 'Elite Access'
                  : form.role === 'PARTNER'
                    ? 'Partner Verification'
                    : 'Identity Verification'
                : form.role === 'PARTNER'
                  ? 'Partner Onboarding'
                  : 'User Onboarding'}
            </p>
            <h2 className="mt-4 break-words font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">
              {mode === 'login'
                ? form.role === 'ADMIN'
                  ? 'Admin panel login'
                  : form.role === 'PARTNER'
                    ? 'Partner login'
                    : 'Login to continue'
                : form.role === 'PARTNER'
                  ? 'Create your partner account'
                  : 'Create your user account'}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'User', value: 'USER', copy: 'Bookings, wishlist, and payments.' },
                  { label: 'Partner', value: 'PARTNER', copy: 'Services, orders, and operations.' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        role: option.value as 'USER' | 'PARTNER' | 'ADMIN',
                        businessName: option.value === 'PARTNER' ? current.businessName : '',
                        city: option.value === 'PARTNER' ? current.city : '',
                        state: option.value === 'PARTNER' ? current.state : ''
                      }))
                    }
                    className={`group rounded-2xl border px-4 py-4 text-left transition-all ${
                      form.role === option.value ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-rose-100 hover:border-rose-200'
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.copy}</p>
                  </button>
                ))}
              </div>
            )}

            {mode === 'signup' ? (
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Full name"
                className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
            ) : null}

            <input
              required
              type="text"
              value={form.identifier}
              onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
              placeholder={mode === 'login' ? 'Email or username' : 'Email address'}
              className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm"
            />

            {mode === 'signup' ? (
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Username (optional)"
                className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
            ) : null}

            <div className="space-y-1">
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Strong password"
                className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
              {mode === 'signup' && form.password.length > 0 && (
                <div className="flex gap-1 px-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= step * 2 ? 'bg-rose-500' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {mode === 'signup' && isPartner ? (
              <div className="grid gap-3 animate-slide-up">
                <input
                  required
                  value={form.businessName}
                  onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
                  placeholder="Partner business name"
                  className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="City"
                    className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                  />
                  <input
                    value={form.state}
                    onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                    placeholder="State"
                    className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                  />
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(225,29,72,0.2)] transition hover:bg-rose-500 disabled:opacity-60"
            >
              {loading ? <PremiumLoader className="mx-auto h-5 w-5 border-white" /> : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-slate-500">
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
            <Link
              href={
                mode === 'login'
                  ? form.role === 'PARTNER'
                    ? '/signup?role=PARTNER'
                    : '/signup?role=USER'
                  : form.role === 'PARTNER'
                    ? '/login?role=PARTNER'
                    : '/login?role=USER'
              }
              className="font-semibold text-rose-700 hover:underline"
            >
              {mode === 'login' ? 'Join Us' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
