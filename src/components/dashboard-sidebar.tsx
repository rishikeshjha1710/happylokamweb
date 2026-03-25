'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  ShieldCheck,
  CreditCard,
  FileText,
  CalendarDays,
  Heart,
  Search,
  LogOut,
  UserCircle,
  PackageCheck,
  ClipboardList,
  History,
  MessageSquareQuote,
  Activity,
  PlusSquare,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SessionRole, logoutSession } from '@/lib/auth';

type SidebarLink = {
  label: string;
  href: string;
  icon: any;
};

const adminLinks: SidebarLink[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'User Directory', href: '/dashboard/admin?tab=users', icon: Users },
  { label: 'Partner Registry', href: '/dashboard/admin?tab=vendors', icon: Store },
  { label: 'Service Catalog', href: '/dashboard/admin?tab=services', icon: ShieldCheck },
  { label: 'Market Bookings', href: '/dashboard/admin?tab=bookings', icon: ClipboardList },
  { label: 'Payment Ledger', href: '/dashboard/admin?tab=payments', icon: CreditCard },
  { label: 'CMS Engine', href: '/dashboard/admin?tab=cms', icon: FileText },
  { label: 'Audit Logs', href: '/dashboard/admin?tab=audit', icon: History },
  { label: 'Platform Health', href: '/dashboard/admin?tab=health', icon: Activity }
];

const vendorLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/dashboard/partner', icon: LayoutDashboard },
  { label: 'Analytics', href: '/dashboard/partner?tab=analytics', icon: Activity },
  { label: 'Add Services', href: '/dashboard/partner?tab=add-service', icon: PlusSquare },
  { label: 'Manage Services', href: '/dashboard/partner?tab=manage-services', icon: PackageCheck },
  { label: 'Orders', href: '/dashboard/partner?tab=orders', icon: CalendarDays },
  { label: 'History', href: '/dashboard/partner?tab=history', icon: History },
  { label: 'Availability', href: '/dashboard/partner?tab=availability', icon: ClipboardList },
  { label: 'Earnings', href: '/dashboard/partner?tab=earnings', icon: CreditCard },
  { label: 'Review Center', href: '/dashboard/partner?tab=reviews', icon: MessageSquareQuote },
  { label: 'Profile', href: '/dashboard/partner?tab=profile', icon: Store }
];

const userLinks: SidebarLink[] = [
  { label: 'Home Base', href: '/dashboard/user', icon: LayoutDashboard },
  { label: 'Explore Market', href: '/dashboard/user?tab=explore', icon: Search },
  { label: 'My Bookings', href: '/dashboard/user?tab=bookings', icon: ClipboardList },
  { label: 'Wishlist', href: '/dashboard/user?tab=wishlist', icon: Heart },
  { label: 'Secure Profile', href: '/dashboard/user?tab=profile', icon: UserCircle }
];

type DashboardSidebarProps = {
  role: SessionRole;
  fullName?: string;
};

export function DashboardSidebar({ role, fullName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const links = role === 'ADMIN' ? adminLinks : role === 'PARTNER' ? vendorLinks : userLinks;
  const rawCurrentTab = searchParams.get('tab');
  const currentTab =
    role === 'PARTNER'
      ? rawCurrentTab === 'services'
        ? 'manage-services'
        : rawCurrentTab === 'bookings'
          ? 'orders'
          : rawCurrentTab === 'payouts'
            ? 'earnings'
            : rawCurrentTab
      : rawCurrentTab;
  const panelLabel = role === 'ADMIN' ? 'Admin Panel' : role === 'PARTNER' ? 'Partner Panel' : 'User Panel';
  const panelSubtitle = role === 'ADMIN' ? 'Protected operations' : role === 'PARTNER' ? 'Business workspace' : 'Personal workspace';

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((current) => !current);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, currentTab]);

  const linkStates = useMemo(() => {
    return links.map((link) => {
      const target = new URL(link.href, 'http://localhost');
      const targetTab = target.searchParams.get('tab');
      const isActive = pathname === target.pathname && (targetTab ? targetTab === currentTab : !currentTab);

      return {
        ...link,
        isActive
      };
    });
  }, [currentTab, links, pathname]);

  const handleLogout = async () => {
    await logoutSession();
    window.location.href = '/login';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen((current) => !current)}
        className="fixed left-4 top-24 z-[70] flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.14)] lg:hidden"
        aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMobileOpen ? <button type="button" aria-label="Close navigation" className="fixed inset-0 z-[55] bg-slate-950/35 lg:hidden" onClick={() => setIsMobileOpen(false)} /> : null}

      <aside
        className={`fixed left-0 top-20 z-[60] flex h-[calc(100vh-5rem)] w-[18rem] flex-col border-r border-slate-200 bg-white/95 backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-20 lg:z-30 lg:h-[calc(100vh-5rem)] lg:translate-x-0 ${
          isDesktopCollapsed ? 'lg:w-[5.75rem]' : 'lg:w-[18rem]'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6 sm:px-6 sm:py-8">
          <div className={`flex items-center gap-3 px-2 ${isDesktopCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-rose-600 shadow-xl shadow-rose-600/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className={`min-w-0 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate font-display text-xl font-bold tracking-tight text-slate-900">{panelLabel}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500">{panelSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDesktopCollapsed((current) => !current)}
              className="ml-auto hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 lg:flex"
              aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isDesktopCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          <nav className="mt-10 flex-1 space-y-2 overflow-y-auto">
            <p className={`px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>Workspace</p>
            <div className="mt-4 space-y-1">
              {linkStates.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.isActive ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-bold transition-all duration-200 sm:px-5 sm:py-3.5 ${
                    link.isActive
                      ? 'bg-rose-600/8 text-rose-600 ring-1 ring-rose-600/15 shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${isDesktopCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  title={isDesktopCollapsed ? link.label : undefined}
                >
                  <link.icon className={`h-5 w-5 ${link.isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                  <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-6">
            <div className={`flex items-center gap-4 px-2 ${isDesktopCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <UserCircle className="h-7 w-7" />
              </div>
              <div className={`min-w-0 flex-1 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>
                <p className="truncate text-sm font-bold text-slate-900">{fullName || 'Secure Navigator'}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {role === 'PARTNER' ? 'Partner account' : role === 'ADMIN' ? 'Admin account' : 'Profile'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 sm:px-5 sm:py-4 ${
                isDesktopCollapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
              title={isDesktopCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="h-5 w-5" />
              <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
