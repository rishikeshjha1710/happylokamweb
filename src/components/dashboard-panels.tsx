'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import {
  BadgeIndianRupee,
  CalendarClock,
  ClipboardList,
  Heart,
  LayoutGrid,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  Activity
} from 'lucide-react';
import {
  ADMIN_ANALYTICS_QUERY,
  ADMIN_BOOKINGS_QUERY,
  ADMIN_SERVICES_QUERY,
  ADMIN_USERS_QUERY,
  ADMIN_VENDORS_QUERY,
  FETCH_BOOKINGS_QUERY,
  ME_QUERY,
  MY_VENDOR_PROFILE_QUERY,
  MY_VENDOR_SERVICES_QUERY,
  MY_WISHLIST_QUERY
} from '@/graphql/queries';
import {
  ActivityTimeline,
  DistributionDonut,
  FilterTabs,
  InsightPanel,
  MetricCard,
  RankedBars,
  TrendChart,
  Skeleton
} from './dashboard-primitives';
import { getHealthEndpoint } from '@/lib/runtime-config';
import {
  AdminCmsManager,
  AdminBookingsManager,
  AdminPaymentsManager,
  AdminUsersManager,
  AdminVendorsManager,
  AdminActivityStream,
  AdminAuditLogManager,
  ProfileSettingsCard,
  UserBookingCard,
  PartnerAvailabilityManager,
  PartnerBookingManager,
  PartnerPayoutManager,
  PartnerProfileManager,
  PartnerServiceStudio,
  PartnerServiceCard,
  VendorReviewManager
} from './management-tools';
import { AdminServicesManager, AdminPartnerOnboardingManager } from './admin-marketplace-tools';
import { GlobalControls, PerformancePulse } from './dashboard-analytics';
import { PublicServiceGrid } from './public-service-grid';

type BookingRecord = {
  id: string;
  status: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  guestCount: number;
  venue: string;
  notes?: string | null;
  totalAmount: number;
  user?: {
    id: string;
    fullName: string;
    email?: string | null;
  };
  vendor: {
    id: string;
    businessName: string;
    city?: string;
    state?: string | null;
  };
  service: {
    id: string;
    title: string;
    slug: string;
    city?: string;
    coverImageUrl?: string | null;
    category?: {
      id?: string;
      name: string;
      slug: string;
    };
  };
  payment?: {
    id: string;
    amount?: number;
    status: string;
    payoutStatus: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    paidAt?: string | null;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
  } | null;
};

type WishlistRecord = {
  id: string;
  title: string;
  slug: string;
  priceFrom: number;
  city: string;
  coverImageUrl?: string | null;
  vendor: {
    businessName: string;
  };
  category: {
    name: string;
  };
};

type PartnerProfileRecord = {
  id: string;
  businessName: string;
  slug: string;
  city: string;
  state?: string | null;
  description?: string | null;
  approvalStatus: string;
  isVerified: boolean;
  ratingAverage: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  availability: Array<{
    id: string;
    startAt: string;
    endAt: string;
    label?: string | null;
  }>;
};

type ServiceRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  status: string;
  approvalStatus: string;
  priceFrom: number;
  city: string;
  state?: string | null;
  durationHours?: number | null;
  guestCapacity?: number | null;
  coverImageUrl?: string | null;
  galleryUrls?: string[] | null;
  isFeatured?: boolean;
  totalReviews: number;
  ratingAverage: number;
  serviceDate?: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    businessName: string;
    approvalStatus?: string;
    city?: string;
    state?: string | null;
  } | null;
  category: {
    id?: string;
    name: string;
    slug: string;
  };
};

type UserRecord = {
  id: string;
  fullName: string;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PartnerRecord = {
  id: string;
  businessName: string;
  city: string;
  state?: string | null;
  approvalStatus: string;
  isVerified: boolean;
  ratingAverage: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type AdminAnalytics = {
  totalUsers: number;
  totalVendors: number;
  approvedVendors: number;
  totalServices: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  paidRevenue: number;
};

type ChartDatum = {
  label: string;
  value: number;
  tone?: string;
};

type HealthPayload = {
  status: string;
  service: string;
  database?: {
    status: string;
    latencyMs?: number;
  };
  timestamp: string;
  uptimeSeconds?: number;
};

const bookingStatusTones: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#06b6d4',
  RESCHEDULED: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  REJECTED: '#64748b'
};

const paymentStatusTones: Record<string, string> = {
  PENDING: '#f59e0b',
  AUTHORIZED: '#0ea5e9',
  PAID: '#10b981',
  FAILED: '#ef4444',
  REFUNDED: '#8b5cf6'
};

const serviceStatusTones: Record<string, string> = {
  DRAFT: '#94a3b8',
  PUBLISHED: '#06b6d4',
  ARCHIVED: '#0f172a'
};

function formatCurrency(value: number) {
  return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
}

function safePercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function monthSeries(dates: Array<string | null | undefined>, months = 6): ChartDatum[] {
  const labels = getMonthWindow(months);
  const counts = new Map(labels.map((item) => [item.key, 0]));
  dates.forEach((value) => {
    if (!value) {
      return;
    }

    const current = new Date(value);
    const key = `${current.getFullYear()}-${current.getMonth()}`;
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return labels.map((item) => ({
    label: item.label,
    value: counts.get(item.key) ?? 0
  }));
}

function getMonthWindow(months = 6) {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const point = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);

    return {
      key: `${point.getFullYear()}-${point.getMonth()}`,
      label: point.toLocaleString('en-IN', { month: 'short' })
    };
  });
}

function monthlyValueSeries<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number,
  months = 6
): ChartDatum[] {
  const labels = getMonthWindow(months);
  const counts = new Map(labels.map((item) => [item.key, 0]));

  items.forEach((item) => {
    const value = getDate(item);
    if (!value) {
      return;
    }

    const current = new Date(value);
    const key = `${current.getFullYear()}-${current.getMonth()}`;
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + getValue(item));
    }
  });

  return labels.map((item) => ({
    label: item.label,
    value: Math.round(counts.get(item.key) ?? 0)
  }));
}

function groupCounts(items: string[], toneMap: Record<string, string>, preferredOrder?: string[]): ChartDatum[] {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));

  const labels = preferredOrder ? preferredOrder.filter((item) => counts.has(item)) : Array.from(counts.keys()).sort();

  return labels.map((label) => ({
    label,
    value: counts.get(label) ?? 0,
    tone: toneMap[label] ?? '#0f172a'
  }));
}

function cityCounts(items: Array<{ city?: string | null }>): ChartDatum[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const label = item.city?.trim() || 'Unassigned';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      tone: index % 2 === 0 ? 'linear-gradient(90deg,#06b6d4,#0f172a)' : 'linear-gradient(90deg,#38bdf8,#6366f1)'
    }));
}

function filterBookings(bookings: BookingRecord[], filter: string) {
  const activeStatuses = ['PENDING', 'CONFIRMED', 'RESCHEDULED'];

  return bookings.filter((booking) => {
    if (filter === 'ALL') {
      return true;
    }

    if (filter === 'ACTIVE') {
      return activeStatuses.includes(booking.status);
    }

    if (filter === 'PAID') {
      return booking.payment?.status === 'PAID';
    }

    if (filter === 'COMPLETED') {
      return booking.status === 'COMPLETED';
    }

    return booking.status === filter;
  });
}

function matchesSearch(values: Array<string | null | undefined>, query: string) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(query));
}

function exportRows(filename: string, headers: string[], rows: string[][]) {
  if (typeof window === 'undefined') {
    return;
  }

  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-20 w-full rounded-[30px]" />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px]" />
      </div>
    </div>
  );
}

function AdminHealthPanel({
  analytics,
  activeOrders,
  pendingPayoutCount
}: {
  analytics: AdminAnalytics | null;
  activeOrders: BookingRecord[];
  pendingPayoutCount: number;
}) {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        const response = await fetch(getHealthEndpoint(), {
          credentials: 'include',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Unable to load health telemetry.');
        }

        const payload = (await response.json()) as HealthPayload;
        if (!cancelled) {
          setHealth(payload);
          setError(null);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load health telemetry.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHealth();
    const intervalId = window.setInterval(loadHealth, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-[30px]" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-red-100 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">Health telemetry</p>
        <h3 className="mt-4 font-display text-3xl tracking-tight text-slate-950">Live health feed is temporarily unavailable.</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InsightPanel
        eyebrow="System health"
        title="Live application and database telemetry"
        copy="This panel is wired to the running backend health endpoint and reports the current PostgreSQL status in real time."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Backend status"
            value={health?.status?.toUpperCase() ?? 'UNKNOWN'}
            hint="Current backend process health reported by the live NestJS service."
            accent="bg-sky-100 text-sky-700"
            icon={<Activity className="h-6 w-6" />}
            badge={health?.service ?? 'backend'}
          />
          <MetricCard
            label="Database"
            value={health?.database?.status?.toUpperCase() ?? 'UNKNOWN'}
            hint="Live PostgreSQL availability reported by the application health check."
            accent="bg-emerald-100 text-emerald-700"
            icon={<ShieldCheck className="h-6 w-6" />}
            badge={health?.database?.latencyMs != null ? `${health.database.latencyMs} ms` : undefined}
          />
          <MetricCard
            label="Runtime uptime"
            value={`${health?.uptimeSeconds ?? 0}s`}
            hint="How long the running backend instance has been continuously serving traffic."
            accent="bg-fuchsia-100 text-fuchsia-700"
            icon={<CalendarClock className="h-6 w-6" />}
          />
          <MetricCard
            label="Pending pressure"
            value={`${activeOrders.length}/${pendingPayoutCount}`}
            hint="Active orders compared with pending payouts currently awaiting operator attention."
            accent="bg-amber-100 text-amber-700"
            icon={<ClipboardList className="h-6 w-6" />}
            badge="orders/payouts"
          />
        </div>
      </InsightPanel>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightPanel eyebrow="Revenue telemetry" title="Commerce signal">
          <p className="text-sm text-slate-600">Paid revenue: {formatCurrency(analytics?.paidRevenue ?? 0)}</p>
          <p className="mt-3 text-sm text-slate-600">Gross throughput: {formatCurrency(analytics?.totalRevenue ?? 0)}</p>
        </InsightPanel>
        <InsightPanel eyebrow="Queue watch" title="Bookings under load">
          <p className="text-sm text-slate-600">Pending bookings: {analytics?.pendingBookings ?? 0}</p>
          <p className="mt-3 text-sm text-slate-600">Active orders: {activeOrders.length}</p>
        </InsightPanel>
        <InsightPanel eyebrow="Snapshot time" title="Last refresh">
          <p className="text-sm text-slate-600">{health?.timestamp ? new Date(health.timestamp).toLocaleString('en-IN') : 'Not available'}</p>
        </InsightPanel>
      </div>
    </div>
  );
}

function UserQuickLinks() {
  return (
    <InsightPanel
      eyebrow="Quick actions"
      title="Move from planning into booking without losing context."
      copy="Open discovery, check your wishlist, or go straight into your next confirmed booking from the user command surface."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/dashboard/user?tab=explore" className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Explore services</p>
          <p className="mt-2 text-sm text-slate-600">Open live marketplace listings inside your user panel without leaving the dashboard.</p>
        </Link>
        <Link href="/dashboard/user" className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Review bookings</p>
          <p className="mt-2 text-sm text-slate-600">Check active orders, payment state, and recent updates from vendors.</p>
        </Link>
        <Link href="/dashboard/user?tab=profile" className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Profile controls</p>
          <p className="mt-2 text-sm text-slate-600">Update your details, stay protected, and manage your personal account settings.</p>
        </Link>
      </div>
    </InsightPanel>
  );
}
export function UserDashboardView() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY);
  const { data: bookingData, loading: bookingLoading, error: bookingError } = useQuery(FETCH_BOOKINGS_QUERY);
  const { data: wishlistData, loading: wishlistLoading, error: wishlistError } = useQuery(MY_WISHLIST_QUERY);
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [wishlistSearch, setWishlistSearch] = useState('');
  const deferredWishlistSearch = useDeferredValue(wishlistSearch);

  const bookings = (bookingData?.fetchBookingDetails ?? []) as BookingRecord[];
  const wishlist = (wishlistData?.myWishlist ?? []) as WishlistRecord[];
  const activeBookings = bookings.filter((booking) => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status));
  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');
  const paidBookings = bookings.filter((booking) => booking.payment?.status === 'PAID');
  const totalSpent = paidBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const nextBooking = [...activeBookings].sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())[0];
  const bookingTrend = monthSeries(bookings.map((booking) => booking.createdAt));
  const bookingStatusItems = groupCounts(bookings.map((booking) => booking.status), bookingStatusTones, [
    'PENDING',
    'CONFIRMED',
    'RESCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ]);
  const paymentItems = groupCounts(
    bookings.map((booking) => booking.payment?.status ?? 'PENDING'),
    paymentStatusTones,
    ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED']
  );
  const filteredBookings = filterBookings(bookings, bookingFilter);
  const filteredWishlist = useMemo(() => {
    const query = deferredWishlistSearch.trim().toLowerCase();
    if (!query) {
      return wishlist;
    }

    return wishlist.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.vendor.businessName.toLowerCase().includes(query) ||
        item.category.name.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query)
    );
  }, [deferredWishlistSearch, wishlist]);

  const recentBookingItems = bookings.slice(0, 5).map((booking) => ({
    id: booking.id,
    title: booking.service.title,
    meta: `${new Date(booking.eventDate).toLocaleDateString('en-IN')} • ${booking.venue} • ${formatCurrency(booking.totalAmount)}`,
    badge: booking.status
  }));

  if (meLoading || bookingLoading || wishlistLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (meError || bookingError || wishlistError) {
    return (
      <div className="rounded-[30px] border border-red-100 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">Service Interruption</p>
        <h3 className="mt-4 font-display text-2xl tracking-tight text-slate-950">We're having trouble loading your dashboard.</h3>
        <p className="mt-3 text-sm text-slate-600">Please check your connection or try again in a moment.</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-slate-950 px-6 py-2 text-sm font-bold text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              label="Profile and trust"
              value={meData?.me?.fullName ?? 'User'}
              hint="Your secure profile remains the center of bookings, payments, reviews, and saved services."
              accent="bg-rose-100 text-rose-700"
              icon={<UserRound className="h-6 w-6" />}
              badge={meData?.me?.role ?? 'USER'}
            />
            <MetricCard
              label="Active bookings"
              value={String(activeBookings.length)}
              hint="Orders currently moving through confirmation, payment, or coordination."
              accent="bg-rose-100 text-rose-700"
              icon={<CalendarClock className="h-6 w-6" />}
            />
            <MetricCard
              label="Payments completed"
              value={formatCurrency(totalSpent)}
              hint="Value successfully verified through the booking and payment flow."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
            <MetricCard
              label="Wishlist depth"
              value={String(wishlist.length)}
              hint="Saved ideas that let you compare vendors before confirming the event."
              accent="bg-fuchsia-100 text-fuchsia-700"
              icon={<Heart className="h-6 w-6" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <TrendChart
              data={bookingTrend}
              color="#38bdf8"
              metricLabel="Booking request history"
              metricValue={`${bookings.length} total requests`}
            />
            <DistributionDonut
              title="Booking pipeline"
              items={bookingStatusItems}
              centerLabel="Completion"
              centerValue={`${safePercent(completedBookings.length, bookings.length)}%`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <InsightPanel
              eyebrow="Next event"
              title={nextBooking ? nextBooking.service.title : 'Your next confirmed event will appear here.'}
              copy={
                nextBooking
                  ? `${new Date(nextBooking.eventDate).toLocaleDateString('en-IN')} • ${nextBooking.venue} • ${formatCurrency(nextBooking.totalAmount)}`
                  : 'Create a booking from the service detail page and this panel will highlight what needs your attention next.'
              }
              className="bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,241,242,0.92))]"
            >
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  {nextBooking?.status ?? 'No active bookings'}
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {paidBookings.length} paid orders
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {completedBookings.length} completed events
                </span>
              </div>
            </InsightPanel>
            <RankedBars title="Payment confidence" items={paymentItems} formatter={(value) => `${value} bookings`} />
          </div>

          <UserQuickLinks />
          <ActivityTimeline title="Recent booking activity" items={recentBookingItems} />
        </>
      )}

      {activeTab === 'bookings' && (
        <InsightPanel eyebrow="Booking center" title="Track orders, payments, reviews, and reschedules from one clean workspace.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterTabs
              value={bookingFilter}
              onChange={setBookingFilter}
              options={[
                { label: 'All', value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Paid', value: 'PAID' },
                { label: 'Completed', value: 'COMPLETED' }
              ]}
            />
            <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {filteredBookings.length} visible
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {filteredBookings.length ? (
              filteredBookings.map((booking) => <UserBookingCard key={booking.id} booking={booking} />)
            ) : (
              <p className="text-sm text-slate-500">No bookings match the current filter yet.</p>
            )}
          </div>
        </InsightPanel>
      )}

      {activeTab === 'wishlist' && (
        <InsightPanel
          eyebrow="Saved shortlist"
          title="Wishlist and discovery memory"
          copy="Review your saved services before turning them into live orders."
        >
          <input
            value={wishlistSearch}
            onChange={(event) => setWishlistSearch(event.target.value)}
            placeholder="Search wishlist"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWishlist.length ? (
              filteredWishlist.map((item) => (
                <Link key={item.id} href={`/services/${item.slug}`} className="block rounded-[32px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                   <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.vendor.businessName} • {item.category.name}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-bold text-rose-600">{formatCurrency(item.priceFrom)}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">No wishlist entries match the current search.</p>
            )}
          </div>
        </InsightPanel>
      )}

      {activeTab === 'explore' && <PublicServiceGrid />}

      {activeTab === 'profile' && <ProfileSettingsCard />}
    </div>
  );
}

export function PartnerDashboardView() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'overview';
  const activeTab =
    requestedTab === 'services'
      ? 'manage-services'
      : requestedTab === 'bookings'
        ? 'orders'
        : requestedTab === 'payouts'
          ? 'earnings'
          : requestedTab;
  
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery(MY_VENDOR_PROFILE_QUERY);
  const { data: serviceData, loading: serviceLoading, error: serviceError } = useQuery(MY_VENDOR_SERVICES_QUERY);
  const { data: bookingData, loading: bookingLoading, error: bookingError } = useQuery(FETCH_BOOKINGS_QUERY);
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewFilters, setOverviewFilters] = useState<{ city: string; status: string }>({
    city: 'ALL',
    status: 'ALL'
  });

  const profile = (profileData?.myVendorProfile ?? null) as PartnerProfileRecord | null;
  const services = (serviceData?.myVendorServices ?? []) as ServiceRecord[];
  const bookings = (bookingData?.fetchBookingDetails ?? []) as BookingRecord[];
  const overviewQuery = overviewSearch.trim().toLowerCase();
  const hasServiceScope = overviewFilters.city !== 'ALL' || overviewFilters.status !== 'ALL';
  const scopedServices = services.filter((service) => {
    const matchesCity = overviewFilters.city === 'ALL' || service.city === overviewFilters.city;
    const matchesStatus = overviewFilters.status === 'ALL' || service.status === overviewFilters.status;
    const matchesQuery = matchesSearch([service.title, service.summary, service.category.name, service.city], overviewQuery);

    return matchesCity && matchesStatus && matchesQuery;
  });
  const scopedServiceIds = new Set(scopedServices.map((service) => service.id));
  const scopedBookings = bookings.filter((booking) => {
    const matchesServiceScope = hasServiceScope ? scopedServiceIds.has(booking.service.id) : true;
    const matchesQuery = !overviewQuery || matchesSearch([booking.service.title, booking.venue, booking.user?.fullName, booking.vendor.businessName], overviewQuery) || scopedServiceIds.has(booking.service.id);

    return matchesServiceScope && matchesQuery;
  });
  const activeOrders = scopedBookings.filter((booking) => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status));
  const paidOrders = scopedBookings.filter((booking) => booking.payment?.status === 'PAID');
  const grossRevenue = paidOrders.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const averageOrderValue = paidOrders.length ? grossRevenue / paidOrders.length : 0;
  const publishedServices = scopedServices.filter((service) => service.status === 'PUBLISHED');
  const payoutPending = paidOrders.filter((booking) => booking.payment?.payoutStatus === 'PENDING');
  const settledPayouts = paidOrders.filter((booking) => booking.payment?.payoutStatus === 'PAID');
  const closedBookings = bookings.filter((booking) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status));
  const bookingTrend = monthSeries(scopedBookings.map((booking) => booking.createdAt));
  const partnerRevenueTrend = monthlyValueSeries(
    paidOrders,
    (booking) => booking.payment?.paidAt ?? booking.updatedAt,
    (booking) => booking.totalAmount
  );
  const partnerBookingVolumeTrend = monthSeries(scopedBookings.map((booking) => booking.createdAt));
  const partnerPulseData = partnerRevenueTrend.map((point, index) => ({
    ...point,
    secondaryValue: partnerBookingVolumeTrend[index]?.value ?? 0
  }));
  const bookingStatusItems = groupCounts(scopedBookings.map((booking) => booking.status), bookingStatusTones, [
    'PENDING',
    'CONFIRMED',
    'RESCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ]);
  const serviceStatusItems = groupCounts(scopedServices.map((service) => service.status), serviceStatusTones, [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
  ]);
  const approvalStatusItems = groupCounts(
    scopedServices.map((service) => service.approvalStatus),
    {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444'
    },
    ['PENDING', 'APPROVED', 'REJECTED']
  );
  const filteredBookings = filterBookings(bookings, bookingFilter);
  const visibleServices = services.filter((service) => serviceFilter === 'ALL' || service.status === serviceFilter);
  const visibleHistory = [...closedBookings].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  const topServices = [...scopedServices]
    .map((service) => {
      const relatedBookings = scopedBookings.filter((booking) => booking.service.id === service.id);
      const serviceRevenue = relatedBookings.filter((booking) => booking.payment?.status === 'PAID').reduce((sum, booking) => sum + booking.totalAmount, 0);

      return {
        label: service.title,
        value: serviceRevenue || relatedBookings.length,
        tone: 'linear-gradient(90deg,#38bdf8,#0f172a)'
      };
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  const orderTimeline = scopedBookings.slice(0, 5).map((booking) => ({
    id: booking.id,
    title: booking.service.title,
    meta: `${booking.user?.fullName ?? 'User'} • ${new Date(booking.eventDate).toLocaleDateString('en-IN')} • ${formatCurrency(booking.totalAmount)}`,
    badge: booking.status
  }));
  const historyTimeline = visibleHistory.slice(0, 8).map((booking) => ({
    id: booking.id,
    title: `${booking.service.title} • ${booking.user?.fullName ?? 'User'}`,
    meta: `${new Date(booking.updatedAt).toLocaleDateString('en-IN')} • ${booking.venue} • ${formatCurrency(booking.totalAmount)}`,
    badge: booking.status
  }));
  const serviceCityDemand = cityCounts(scopedServices.map((service) => ({ city: service.city })));
  const completionRate = safePercent(scopedBookings.filter((booking) => booking.status === 'COMPLETED').length, scopedBookings.length);
  const paymentConversionRate = safePercent(paidOrders.length, scopedBookings.length);
  const reviewCoverageRate = safePercent(scopedServices.filter((service) => service.totalReviews > 0).length, scopedServices.length);

  if (profileLoading || serviceLoading || bookingLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (profileError || serviceError || bookingError) {
    return (
      <div className="rounded-[30px] border border-red-100 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">Service Interruption</p>
        <h3 className="mt-4 font-display text-2xl tracking-tight text-slate-950">We're having trouble loading your partner panel.</h3>
        <p className="mt-3 text-sm text-slate-600">This might be due to a server update or regional connectivity issues.</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-slate-950 px-6 py-2 text-sm font-bold text-white">Retry Refresh</button>
      </div>
    );
  }

  const exportPartnerSnapshot = () =>
    exportRows(
      'partner-dashboard.csv',
      ['Service', 'Status', 'City', 'Price From', 'Related Orders'],
      scopedServices.map((service) => [
        service.title,
        service.status,
        service.city,
        String(service.priceFrom),
        String(scopedBookings.filter((booking) => booking.service.id === service.id).length)
      ])
    );

  return (
    <div className="space-y-8">
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              label="Partner identity"
              value={profile?.businessName || 'Elite Partner'}
              hint="Your verified partner profile manages the shop front, service catalog, and customer trust."
              accent="bg-rose-100 text-rose-700"
              icon={<Store className="h-6 w-6" />}
              badge={profile?.approvalStatus}
            />
            <MetricCard
              label="Live services"
              value={String(services.length)}
              hint="Managed celebration offerings currently available for public discovery."
              accent="bg-sky-100 text-sky-700"
              icon={<LayoutGrid className="h-6 w-6" />}
            />
            <MetricCard
              label="Active bookings"
              value={String(activeOrders.length)}
              hint="Orders currently under coordination or awaiting partner action."
              accent="bg-amber-100 text-amber-700"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <MetricCard
              label="Total revenue"
              value={formatCurrency(grossRevenue)}
              hint="Gross value of all completed and paid bookings in your history."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
          </div>

          <GlobalControls 
            cities={Array.from(new Set(services.map((service) => service.city))).filter(Boolean)}
            statuses={['DRAFT', 'PUBLISHED', 'ARCHIVED']}
            onSearch={setOverviewSearch}
            onFilterChange={(filters) => setOverviewFilters(filters)}
            onExport={exportPartnerSnapshot}
            exportLabel="Export partner data"
          />

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
            <PerformancePulse
              data={partnerPulseData}
              title="Revenue & booking pulse"
              mainLabel="Revenue"
              secondaryLabel="Orders"
            />
            <DistributionDonut
              title="Booking execution mix"
              items={bookingStatusItems}
              centerLabel="Win rate"
              centerValue={`${safePercent(scopedBookings.filter((item) => ['CONFIRMED', 'COMPLETED'].includes(item.status)).length, scopedBookings.length)}%`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <RankedBars
              title="Best performing services"
              items={topServices.length ? topServices : [{ label: 'No service data yet', value: 0, tone: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' }]}
              formatter={(value) => (value > 0 ? formatCurrency(value) : 'No bookings yet')}
            />
            <InsightPanel
              eyebrow="Commercial health"
              title="Marketplace readiness"
              copy="Track approval, publishing, payouts, and average order value so your business runs like a professional operations desk."
              className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.9))]"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Verified profile</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{profile?.isVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Average order</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{formatCurrency(averageOrderValue)}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Payout pending</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{payoutPending.length}</p>
                </div>
              </div>
              <div className="mt-6">
                <DistributionDonut
                  title="Listing mix"
                  items={serviceStatusItems}
                  centerLabel="Published"
                  centerValue={`${safePercent(publishedServices.length, scopedServices.length)}%`}
                />
              </div>
            </InsightPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ActivityTimeline title="Recent order history" items={orderTimeline} />
            <InsightPanel eyebrow="Service Quick Look" title="Your live inventory by state.">
              <div className="space-y-3">
                {publishedServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="rounded-[24px] border border-slate-200 p-4 bg-white/50">
                    <p className="font-semibold text-slate-900">{service.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatCurrency(service.priceFrom)} • {service.ratingAverage.toFixed(1)} rating</p>
                  </div>
                ))}
                {!publishedServices.length ? <p className="text-sm text-slate-500">Adjust the overview filters to inspect live inventory from the database.</p> : null}
              </div>
            </InsightPanel>
          </div>

          <InsightPanel
            eyebrow="Partner shortcuts"
            title="Move quickly between operations, creation, and follow-up."
            copy="Each action opens a live workspace connected to your actual services, bookings, payouts, and partner profile."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/partner?tab=add-service" className="rounded-[24px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold text-slate-900">Add a new service</p>
                <p className="mt-2 text-sm text-slate-600">Create and publish a fresh listing into your partner catalog.</p>
              </Link>
              <Link href="/dashboard/partner?tab=manage-services" className="rounded-[24px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold text-slate-900">Manage live inventory</p>
                <p className="mt-2 text-sm text-slate-600">Update pricing, summaries, publish state, and archived listings from the database.</p>
              </Link>
              <Link href="/dashboard/partner?tab=orders" className="rounded-[24px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold text-slate-900">Open order manager</p>
                <p className="mt-2 text-sm text-slate-600">Review active bookings, update statuses, and handle execution without leaving the panel.</p>
              </Link>
            </div>
          </InsightPanel>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              label="Completion rate"
              value={`${completionRate}%`}
              hint="Share of booking history that has successfully reached completion."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
            <MetricCard
              label="Payment conversion"
              value={`${paymentConversionRate}%`}
              hint="Paid booking share compared with all booking activity in your panel."
              accent="bg-sky-100 text-sky-700"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <MetricCard
              label="Review coverage"
              value={`${reviewCoverageRate}%`}
              hint="How many of your services already have public review signals."
              accent="bg-amber-100 text-amber-700"
              icon={<Store className="h-6 w-6" />}
            />
            <MetricCard
              label="Settled payouts"
              value={String(settledPayouts.length)}
              hint="Paid booking payouts already settled to your partner account."
              accent="bg-rose-100 text-rose-700"
              icon={<Activity className="h-6 w-6" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <TrendChart
              data={partnerRevenueTrend}
              color="#e11d48"
              metricLabel="Revenue trend"
              metricValue={formatCurrency(grossRevenue)}
            />
            <TrendChart
              data={partnerBookingVolumeTrend}
              color="#0ea5e9"
              metricLabel="Booking volume"
              metricValue={String(scopedBookings.length)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DistributionDonut
              title="Approval pipeline"
              items={approvalStatusItems.length ? approvalStatusItems : [{ label: 'No approvals yet', value: 0, tone: '#cbd5e1' }]}
              centerLabel="Published"
              centerValue={`${publishedServices.length}`}
            />
            <RankedBars
              title="Service coverage by city"
              items={serviceCityDemand.length ? serviceCityDemand : [{ label: 'No city data yet', value: 0, tone: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' }]}
              formatter={(value) => `${value} listings`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <RankedBars
              title="Top commercial performers"
              items={topServices.length ? topServices : [{ label: 'No service data yet', value: 0, tone: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' }]}
              formatter={(value) => (value > 0 ? formatCurrency(value) : 'No revenue yet')}
            />
            <DistributionDonut
              title="Booking status mix"
              items={bookingStatusItems}
              centerLabel="Closed"
              centerValue={`${closedBookings.length}`}
            />
          </div>
        </div>
      )}

      {activeTab === 'add-service' && (
        <div className="space-y-8">
          <PartnerServiceStudio showExistingServices={false} />
        </div>
      )}

      {activeTab === 'manage-services' && (
        <div className="space-y-8">
          <InsightPanel eyebrow="Service lineup" title="Review, update, and archive your inventory.">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterTabs
                value={serviceFilter}
                onChange={setServiceFilter}
                options={[
                  { label: 'All', value: 'ALL' },
                  { label: 'Drafts', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' },
                  { label: 'Archived', value: 'ARCHIVED' }
                ]}
              />
              <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {visibleServices.length} services
              </span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {visibleServices.map((service) => (
                <PartnerServiceCard key={service.id} service={service} />
              ))}
            </div>
          </InsightPanel>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-8">
          <InsightPanel eyebrow="Orders" title="Manage your active work and booking history.">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterTabs
                value={bookingFilter}
                onChange={setBookingFilter}
                options={[
                  { label: 'All', value: 'ALL' },
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Paid', value: 'PAID' },
                  { label: 'Completed', value: 'COMPLETED' }
                ]}
              />
              <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {filteredBookings.length} visible
              </span>
            </div>
            <div className="mt-6">
              <PartnerBookingManager bookings={filteredBookings} />
            </div>
          </InsightPanel>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-8">
          <div className="grid gap-4 xl:grid-cols-3">
            <MetricCard
              label="Closed orders"
              value={String(closedBookings.length)}
              hint="Completed, cancelled, or rejected bookings already stored in your partner history."
              accent="bg-slate-100 text-slate-700"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <MetricCard
              label="Paid history"
              value={String(paidOrders.length)}
              hint="Bookings in your history with confirmed successful payments."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
            <MetricCard
              label="Pending payouts"
              value={String(payoutPending.length)}
              hint="History records that still need payout settlement processing."
              accent="bg-amber-100 text-amber-700"
              icon={<Activity className="h-6 w-6" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ActivityTimeline title="Booking history timeline" items={historyTimeline} />
            <InsightPanel eyebrow="Settlement history" title="Payout and fulfilment progress">
              <div className="space-y-4">
                {paidOrders.slice(0, 6).map((booking) => (
                  <div key={booking.id} className="rounded-[24px] border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{booking.service.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(booking.updatedAt).toLocaleDateString('en-IN')} • {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {booking.payment?.payoutStatus ?? 'NOT_REQUESTED'}
                      </span>
                    </div>
                  </div>
                ))}
                {!paidOrders.length ? <p className="text-sm text-slate-500">Payment-backed history will appear here after your first paid booking.</p> : null}
              </div>
            </InsightPanel>
          </div>
        </div>
      )}

      {activeTab === 'availability' && <PartnerAvailabilityManager availability={profile?.availability ?? []} />}
      {activeTab === 'earnings' && (
        <div className="space-y-8">
          <div className="grid gap-4 xl:grid-cols-3">
            <MetricCard
              label="Gross paid revenue"
              value={formatCurrency(grossRevenue)}
              hint="Live paid booking value pulled from your booking and payment records."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
            <MetricCard
              label="Average order value"
              value={formatCurrency(averageOrderValue)}
              hint="Average value of successful paid orders on your partner account."
              accent="bg-sky-100 text-sky-700"
              icon={<LayoutGrid className="h-6 w-6" />}
            />
            <MetricCard
              label="Requested payouts"
              value={String(payoutPending.length + settledPayouts.length)}
              hint="All partner payout records that have entered the payout workflow."
              accent="bg-rose-100 text-rose-700"
              icon={<Activity className="h-6 w-6" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <TrendChart
              data={partnerRevenueTrend}
              color="#059669"
              metricLabel="Collected revenue"
              metricValue={formatCurrency(grossRevenue)}
            />
            <DistributionDonut
              title="Payout status mix"
              items={groupCounts(
                paidOrders.map((booking) => booking.payment?.payoutStatus ?? 'NOT_REQUESTED'),
                {
                  NOT_REQUESTED: '#94a3b8',
                  PENDING: '#f59e0b',
                  PAID: '#10b981'
                },
                ['NOT_REQUESTED', 'PENDING', 'PAID']
              )}
              centerLabel="Eligible"
              centerValue={`${paidOrders.length}`}
            />
          </div>

          <PartnerPayoutManager bookings={bookings} />
        </div>
      )}
      {activeTab === 'profile' && <PartnerProfileManager profile={profile ?? {}} />}

      {activeTab === 'reviews' && <VendorReviewManager />}
    </div>
  );
}

export function AdminDashboardView() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useQuery(ADMIN_ANALYTICS_QUERY);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(ADMIN_USERS_QUERY);
  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useQuery(ADMIN_VENDORS_QUERY);
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(ADMIN_BOOKINGS_QUERY);
  const { data: servicesData, loading: servicesLoading, error: servicesError } = useQuery(ADMIN_SERVICES_QUERY);
  const [bookingFilter, setBookingFilter] = useState('ACTIVE');
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewFilters, setOverviewFilters] = useState<{ city: string; status: string }>({
    city: 'ALL',
    status: 'ALL'
  });

  const analytics = (analyticsData?.fetchAdminAnalytics ?? null) as AdminAnalytics | null;
  const users = (usersData?.adminUsers ?? []) as UserRecord[];
  const partners = (vendorsData?.adminVendors ?? []) as PartnerRecord[];
  const bookings = (bookingsData?.adminBookings ?? []) as BookingRecord[];
  const services = (servicesData?.adminServices ?? []) as ServiceRecord[];
  const overviewQuery = overviewSearch.trim().toLowerCase();
  const hasPartnerScope = overviewFilters.city !== 'ALL' || overviewFilters.status !== 'ALL';
  const basePartners = partners.filter((partner) => {
    const matchesCity = overviewFilters.city === 'ALL' || partner.city === overviewFilters.city;
    const matchesStatus = overviewFilters.status === 'ALL' || partner.approvalStatus === overviewFilters.status;

    return matchesCity && matchesStatus;
  });
  const basePartnerIds = new Set(basePartners.map((partner) => partner.id));
  const scopedPartners = basePartners.filter((partner) =>
    matchesSearch([partner.businessName, partner.city, partner.owner?.fullName, partner.owner?.email], overviewQuery)
  );
  const scopedUsers = users.filter((user) => matchesSearch([user.fullName, user.email, user.username, user.phone], overviewQuery));
  const scopedServices = services.filter((service) => {
    const matchesPartnerScope = hasPartnerScope ? basePartnerIds.has(service.vendor?.id ?? '') : true;
    const matchesCity = overviewFilters.city === 'ALL' || service.city === overviewFilters.city;
    const matchesQuery = matchesSearch([service.title, service.summary, service.city, service.vendor?.businessName, service.category.name], overviewQuery);

    return matchesPartnerScope && matchesCity && matchesQuery;
  });
  const scopedBookings = bookings.filter((booking) => {
    const matchesPartnerScope = hasPartnerScope ? basePartnerIds.has(booking.vendor.id) : true;
    const matchesCity = overviewFilters.city === 'ALL' || booking.vendor.city === overviewFilters.city || booking.service.city === overviewFilters.city;
    const matchesQuery = matchesSearch([booking.service.title, booking.user?.fullName, booking.vendor.businessName, booking.venue], overviewQuery);

    return matchesPartnerScope && matchesCity && matchesQuery;
  });

  const activeOrders = scopedBookings.filter((booking) => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status));
  const scopedPaidBookings = scopedBookings.filter((booking) => booking.payment?.status === 'PAID');
  const pendingPayouts = scopedBookings.filter((booking) => booking.payment?.payoutStatus === 'PENDING');
  const paymentSuccessRate = safePercent(scopedPaidBookings.length, scopedBookings.filter((booking) => booking.payment).length);
  const partnerApprovalRate = safePercent(scopedPartners.filter((vendor) => vendor.approvalStatus === 'APPROVED').length, scopedPartners.length);
  const servicePublishRate = safePercent(scopedServices.filter((service) => service.status === 'PUBLISHED').length, scopedServices.length);
  const adminRevenueTrend = monthlyValueSeries(
    scopedPaidBookings,
    (booking) => booking.payment?.paidAt ?? booking.updatedAt,
    (booking) => booking.totalAmount
  );
  const adminBookingVolumeTrend = monthSeries(scopedBookings.map((booking) => booking.createdAt));
  const adminPulseData = adminRevenueTrend.map((point, index) => ({
    ...point,
    secondaryValue: adminBookingVolumeTrend[index]?.value ?? 0
  }));
  const bookingStatusItems = groupCounts(scopedBookings.map((booking) => booking.status), bookingStatusTones, [
    'PENDING',
    'CONFIRMED',
    'RESCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ]);
  const paymentStatusItems = groupCounts(scopedBookings.map((booking) => booking.payment?.status ?? 'PENDING'), paymentStatusTones, [
    'PENDING',
    'AUTHORIZED',
    'PAID',
    'FAILED',
    'REFUNDED'
  ]);
  const cityDemand = cityCounts(scopedBookings.map((booking) => ({ city: booking.vendor.city })));
  const partnerApprovalItems = groupCounts(
    scopedPartners.map((partner) => partner.approvalStatus),
    {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      SUSPENDED: '#64748b'
    },
    ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']
  );
  const serviceCategoryDemand = Array.from(
    scopedServices.reduce((map, service) => {
      const current = map.get(service.category.name) ?? 0;
      map.set(service.category.name, current + 1);
      return map;
    }, new Map<string, number>()).entries()
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      tone: index % 2 === 0 ? 'linear-gradient(90deg,#0f766e,#34d399)' : 'linear-gradient(90deg,#0f172a,#38bdf8)'
    }));
  const topPartners = scopedPartners
    .map((vendor: PartnerRecord) => ({
      label: vendor.businessName,
      value: scopedBookings.filter((booking) => booking.vendor.id === vendor.id).length,
      tone: 'linear-gradient(90deg,#22d3ee,#0f172a)'
    }))
    .sort((left: any, right: any) => right.value - left.value)
    .slice(0, 5);
  const platformHealth = [
    { label: 'Partner approval', value: partnerApprovalRate, tone: 'linear-gradient(90deg,#22d3ee,#0284c7)' },
    { label: 'Service publish rate', value: servicePublishRate, tone: 'linear-gradient(90deg,#38bdf8,#0f172a)' },
    { label: 'Payment success', value: paymentSuccessRate, tone: 'linear-gradient(90deg,#34d399,#0f766e)' },
    { label: 'Active order pressure', value: safePercent(activeOrders.length, bookings.length), tone: 'linear-gradient(90deg,#f59e0b,#b45309)' }
  ];
  const filteredBookings = filterBookings(bookings, bookingFilter);
  const adminVisibleBookings = filteredBookings.map((booking) => ({
    ...booking,
    user: booking.user ?? { id: 'unknown-user', fullName: 'User' }
  }));
  const activeOrderTimeline = activeOrders.slice(0, 6).map((booking) => ({
    id: booking.id,
    title: `${booking.service.title} • ${booking.vendor.businessName}`,
    meta: `${booking.user?.fullName ?? 'User'} • ${new Date(booking.eventDate).toLocaleDateString('en-IN')} • ${formatCurrency(booking.totalAmount)}`,
    badge: booking.status
  }));

  if (analyticsLoading || usersLoading || vendorsLoading || bookingsLoading || servicesLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (analyticsError || usersError || vendorsError || bookingsError || servicesError) {
    return (
      <div className="rounded-[30px] border border-red-100 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">Service Interruption</p>
        <h3 className="mt-4 font-display text-2xl tracking-tight text-slate-950">We're having trouble loading the master dashboard.</h3>
        <p className="mt-3 text-sm text-slate-600">This might be due to a server update or regional connectivity issues.</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-slate-950 px-6 py-2 text-sm font-bold text-white">Force Refresh</button>
      </div>
    );
  }


  const exportAdminSnapshot = () =>
    exportRows(
      'admin-dashboard.csv',
      ['Booking', 'Customer', 'Partner', 'Status', 'Amount'],
      scopedBookings.map((booking) => [
        booking.service.title,
        booking.user?.fullName ?? 'User',
        booking.vendor.businessName,
        booking.status,
        String(booking.totalAmount)
      ])
    );

  return (
    <div className="space-y-8">
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              label="Platform reach"
              value={String(scopedUsers.length)}
              hint="Database-backed user accounts matching the current search scope."
              accent="bg-sky-100 text-sky-700"
              icon={<Users className="h-6 w-6" />}
              badge="Accounts"
            />
            <MetricCard
              label="Active orders"
              value={String(activeOrders.length)}
              hint="Orders currently demanding coordination, support, fulfillment, or payment follow-up."
              accent="bg-amber-100 text-amber-700"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <MetricCard
              label="Paid revenue"
              value={formatCurrency(scopedPaidBookings.reduce((sum, booking) => sum + booking.totalAmount, 0))}
              hint="Captured booking value inside the currently filtered admin scope."
              accent="bg-emerald-100 text-emerald-700"
              icon={<BadgeIndianRupee className="h-6 w-6" />}
            />
            <MetricCard
              label="Verified Partners"
              value={`${scopedPartners.filter((vendor) => vendor.approvalStatus === 'APPROVED').length}/${scopedPartners.length || 0}`}
              hint="Approved businesses inside the active admin scope."
              accent="bg-rose-100 text-rose-700"
              icon={<ShieldCheck className="h-6 w-6" />}
              badge="Partners"
            />
          </div>

          <GlobalControls 
            cities={Array.from(new Set(partners.map((partner) => partner.city))).filter(Boolean)}
            statuses={['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']}
            onSearch={setOverviewSearch}
            onFilterChange={(filters) => setOverviewFilters(filters)}
            onExport={exportAdminSnapshot}
            exportLabel="Export admin scope"
          />

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
            <PerformancePulse
              data={adminPulseData}
              title="Revenue & booking pulse"
              mainLabel="Revenue"
              secondaryLabel="Bookings"
            />
            <DistributionDonut
              title="Order pipeline"
              items={bookingStatusItems}
              centerLabel="Payments paid"
              centerValue={`${paymentSuccessRate}%`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <RankedBars title="Platform performance" items={platformHealth} formatter={(value) => `${value}%`} />
            <div className="grid gap-6 lg:grid-cols-2">
              <RankedBars title="Top demand cities" items={cityDemand} formatter={(value) => `${value} bookings`} />
              <RankedBars
                title="Most active partners"
                items={topPartners.length ? topPartners : [{ label: 'No partner load yet', value: 0, tone: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' }]}
                formatter={(value) => `${value} orders`}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
            <DistributionDonut
              title="Partner approval mix"
              items={partnerApprovalItems}
              centerLabel="Approved"
              centerValue={`${partnerApprovalRate}%`}
            />
            <RankedBars
              title="Service category demand"
              items={serviceCategoryDemand.length ? serviceCategoryDemand : [{ label: 'No category data yet', value: 0, tone: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' }]}
              formatter={(value) => `${value} listings`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <InsightPanel
              eyebrow="Executive watch"
              title="Operational pressure and platform balance"
              copy="Track pending payouts, partner supply, published inventory, and payment health from a single executive control surface."
              className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.9))]"
            >
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending payouts</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{pendingPayouts.length}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Published services</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{scopedServices.filter((service) => service.status === 'PUBLISHED').length}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending bookings</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{scopedBookings.filter((booking) => booking.status === 'PENDING').length}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Revenue throughput</p>
                  <p className="mt-3 font-display text-3xl tracking-tight text-slate-950">{formatCurrency(scopedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0))}</p>
                </div>
              </div>
              <div className="mt-6">
                <DistributionDonut
                  title="Payment health"
                  items={paymentStatusItems}
                  centerLabel="Paid"
                  centerValue={`${scopedPaidBookings.length}`}
                />
              </div>
            </InsightPanel>
            <InsightPanel eyebrow="Activity stream" title="Recent platform events.">
              <AdminActivityStream />
            </InsightPanel>
            <ActivityTimeline title="Active order watchlist" items={activeOrderTimeline} />
          </div>
        </>
      )}

      {activeTab === 'users' && <AdminUsersManager />}
      {activeTab === 'vendors' && (
        <div className="space-y-8">
          <AdminPartnerOnboardingManager />
          <AdminVendorsManager />
        </div>
      )}
      {activeTab === 'services' && <AdminServicesManager />}
      {activeTab === 'bookings' && <AdminBookingsManager bookings={adminVisibleBookings} />}
      {activeTab === 'payments' && <AdminPaymentsManager />}
      {activeTab === 'cms' && <AdminCmsManager />}
      
      {activeTab === 'audit' && <AdminAuditLogManager />}
      {activeTab === 'profile' && <ProfileSettingsCard />}
      
      {activeTab === 'health' && <AdminHealthPanel analytics={analytics} activeOrders={activeOrders} pendingPayoutCount={pendingPayouts.length} />}
    </div>
  );
}
