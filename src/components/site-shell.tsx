'use client';

import Link from 'next/link';
import { PropsWithChildren, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDashboardPathForRole, logoutSession, readStoredSession, SessionRole } from '@/lib/auth';
import { Github, Instagram, ShieldCheck, Store, Twitter, UserCircle } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/#journeys', label: 'Processes' },
  { href: '/#platform', label: 'Platform' }
];

const roleActions: Record<SessionRole, { label: string; icon: typeof UserCircle }> = {
  USER: { label: 'Profile', icon: UserCircle },
  PARTNER: { label: 'Partner Panel', icon: Store },
  ADMIN: { label: 'Admin Panel', icon: ShieldCheck }
};

const socialLinks = [
  { href: 'https://x.com', label: 'Open X', icon: Twitter },
  { href: 'https://www.instagram.com', label: 'Open Instagram', icon: Instagram },
  { href: 'https://github.com', label: 'Open GitHub', icon: Github }
] as const;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="font-display text-xl font-black italic tracking-tight text-rose-600 md:text-2xl">happylokam</p>
      {!compact ? <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-rose-500">Premium Celebration Network</p> : null}
    </div>
  );
}

function getExploreHref(role: SessionRole | null) {
  if (role === 'USER') {
    return '/dashboard/user?tab=explore';
  }

  if (role === 'PARTNER') {
    return '/dashboard/partner?tab=analytics';
  }

  if (role === 'ADMIN') {
    return '/dashboard/admin?tab=services';
  }

  return '/explore';
}

export function SiteShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<SessionRole | null>(null);
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    const session = readStoredSession();
    setRole(session.role);
    if (typeof window !== 'undefined') {
      setCurrentTab(new URLSearchParams(window.location.search).get('tab'));
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncTab = () => setCurrentTab(new URLSearchParams(window.location.search).get('tab'));
    const navigationEvent = 'happylokam:navigation';
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function pushState(...args) {
      originalPushState(...args);
      window.dispatchEvent(new Event(navigationEvent));
    };

    window.history.replaceState = function replaceState(...args) {
      originalReplaceState(...args);
      window.dispatchEvent(new Event(navigationEvent));
    };

    window.addEventListener('popstate', syncTab);
    window.addEventListener(navigationEvent, syncTab);
    syncTab();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', syncTab);
      window.removeEventListener(navigationEvent, syncTab);
    };
  }, []);

  const workspaceHref = getDashboardPathForRole(role);
  const exploreHref = getExploreHref(role);

  return (
    <div className="min-h-screen bg-[#fffcfd] text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      <header className="sticky top-0 z-50 w-full border-b border-rose-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const resolvedHref = link.href === '/explore' ? getExploreHref(role) : link.href;
              const target = new URL(resolvedHref, 'http://localhost');
              const targetPath = target.pathname || '/';
              const targetTab = target.searchParams.get('tab');
              const isActive = targetTab
                ? pathname === targetPath && currentTab === targetTab
                : targetPath === '/'
                  ? pathname === '/'
                  : pathname.startsWith(targetPath);

              return (
                <Link
                  key={`${link.label}-${resolvedHref}`}
                  href={resolvedHref}
                  className={`relative rounded-full px-5 py-2 text-sm font-bold transition-all hover:bg-rose-50/50 ${
                    isActive ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {role ? (
              <div className="flex items-center gap-3">
                {(() => {
                  const action = roleActions[role];
                  const Icon = action.icon;

                  return (
                    <Link
                      href={workspaceHref}
                      className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/80 p-1.5 pr-5 transition hover:bg-rose-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/20 transition-transform group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="hidden flex-col text-left md:flex">
                        <span className="text-sm font-bold text-slate-900">{action.label}</span>
                      </div>
                    </Link>
                  );
                })()}
                <button
                  type="button"
                  onClick={async () => {
                    await logoutSession();
                    setRole(null);
                    router.push('/login');
                  }}
                  className="rounded-full border border-rose-100 px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login?role=USER"
                  className="text-sm font-bold text-slate-600 transition hover:text-rose-600"
                >
                  Login
                </Link>
                <Link
                  href="/signup?role=USER"
                  className="rounded-full bg-rose-600 px-7 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(225,29,72,0.25)] transition hover:scale-105 hover:bg-rose-500"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-rose-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <BrandMark compact />
              </Link>
              <p className="mt-6 max-w-md text-base leading-8 text-slate-600">
                Celebration is a fundamental human joy. We exist to ensure that every family can celebrate their milestones without the struggle of complex planning and slow bookings.
              </p>
              <div className="mt-8 flex gap-4">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 text-slate-400 transition hover:border-rose-300 hover:text-rose-600"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Plan</p>
              <ul className="mt-6 space-y-4 text-sm font-medium text-slate-600">
                <li><Link href={exploreHref} className="hover:text-rose-600">Explore Services</Link></li>
                <li><Link href="/signup?role=USER" className="hover:text-rose-600">User Signup</Link></li>
                <li><Link href="/login?role=USER" className="hover:text-rose-600">User Login</Link></li>
                <li><Link href="/#about" className="hover:text-rose-600">About Our Mission</Link></li>
                <li><Link href="/#platform" className="hover:text-rose-600">Platform Highlights</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Account</p>
              <ul className="mt-6 space-y-4 text-sm font-medium text-slate-600">
                <li className="pt-2"><div className="h-px bg-rose-50" /></li>
                <li><Link href="/signup?role=PARTNER" className="hover:text-rose-600">Partner Signup</Link></li>
                <li><Link href="/login?role=PARTNER" className="hover:text-rose-600">Partner Login</Link></li>
                <li><Link href="/login?role=ADMIN" className="font-bold hover:text-rose-600">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 border-t border-rose-50 pt-8 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              &copy; 2026 happylokam Pvt Ltd. Making Celebrations Beautiful.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
