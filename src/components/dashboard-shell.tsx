'use client';

import { PropsWithChildren } from 'react';
import { useQuery } from '@apollo/client';
import { SessionRole } from '@/lib/auth';
import { ME_QUERY } from '@/graphql/queries';
import { RoleGate } from './role-gate';
import { DashboardSidebar } from './dashboard-sidebar';

type DashboardShellProps = PropsWithChildren<{
  requiredRole: SessionRole;
  eyebrow: string;
  title: string;
  description: string;
  tone: 'user' | 'partner' | 'admin';
  highlights: string[];
  heroVariant?: 'full' | 'hidden';
}>;

const toneStyles = {
  user: {
    shell: 'bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,250,0.98))]',
    hero: 'bg-[linear-gradient(140deg,rgba(15,23,42,0.98),rgba(159,18,57,0.94))]'
  },
  partner: {
    shell: 'bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(159,18,57,0.06),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,245,248,0.98))]',
    hero: 'bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(190,18,60,0.92))]'
  },
  admin: {
    shell: 'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,252,255,0.99))]',
    hero: 'bg-[linear-gradient(140deg,rgba(2,6,23,0.99),rgba(15,23,42,0.96))]'
  }
} as const;

export function DashboardShell({
  requiredRole,
  eyebrow,
  title,
  description,
  tone,
  highlights,
  heroVariant = 'full',
  children
}: DashboardShellProps) {
  const { data: meData } = useQuery(ME_QUERY);

  return (
    <RoleGate requiredRole={requiredRole}>
      <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50/50">
        <DashboardSidebar role={requiredRole} fullName={meData?.me?.fullName} />
        <main className={`min-w-0 flex-1 overflow-y-auto ${toneStyles[tone].shell}`}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-10 xl:px-10 xl:py-12">
            {heroVariant === 'full' ? (
              <header className={`relative overflow-hidden rounded-[32px] border border-white/40 px-5 py-6 text-white shadow-[0_40px_140px_rgba(15,23,42,0.12)] sm:px-6 sm:py-8 md:rounded-[40px] md:px-10 md:py-12 ${toneStyles[tone].hero}`}>
                <div className="absolute -right-14 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute left-1/3 top-0 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_60%)] lg:block" />

                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const event = new CustomEvent('toggle-sidebar');
                          window.dispatchEvent(event);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 lg:hidden"
                        aria-label="Toggle Navigation"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </button>
                      <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                        {eyebrow}
                      </span>
                    </div>
                    <h1 className="mt-6 break-words font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                      {title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
                      {description}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:rounded-[32px] md:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">Quick Insights</p>
                    <div className="mt-5 space-y-3">
                      {highlights.map((highlight, index) => (
                        <div key={highlight} className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white/90">
                            {index + 1}
                          </span>
                          <p className="text-sm leading-6 text-white/80">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </header>
            ) : null}

            <div className={heroVariant === 'full' ? 'mt-12' : ''}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </RoleGate>
  );
}
