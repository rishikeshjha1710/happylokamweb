'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { FETCH_SERVICES_QUERY, SERVICE_BY_SLUG_QUERY, SERVICE_REVIEWS_QUERY, VENDOR_PROFILE_QUERY } from '@/graphql/queries';
import { Skeleton } from './dashboard-primitives';
import { MarketplaceImage } from './marketplace-image';
import { ServiceActionPanel } from './management-tools';

export function ServiceDetailView({ slug }: { slug: string }) {
  const { data, loading } = useQuery(SERVICE_BY_SLUG_QUERY, {
    variables: { slug }
  });

  const service = data?.serviceBySlug;

  const { data: reviewData } = useQuery(SERVICE_REVIEWS_QUERY, {
    variables: { serviceId: service?.id ?? '' },
    skip: !service?.id
  });

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="min-h-[420px] rounded-[36px]" />
          <Skeleton className="min-h-[420px] rounded-[36px]" />
        </div>
      </section>
    );
  }

  if (!service) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-slate-500">Service not found.</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="relative min-h-[420px] overflow-hidden rounded-[36px]">
            <MarketplaceImage
              src={service.coverImageUrl ?? service.galleryUrls?.[0]}
              alt={service.title}
              fill
              priority
              sizes="(min-width: 1280px) 58vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="pill border-white/20 bg-white/10 text-white">{service.category.name}</span>
              <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">{service.title}</h1>
              <p className="mt-4 max-w-2xl text-base text-white/80">{service.summary}</p>
            </div>
          </div>
          <div className="panel">
            <h2 className="font-display text-3xl tracking-tight">Experience overview</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="stat-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Starts at</p>
                <p className="mt-2 font-display text-2xl text-slate-950">Rs. {service.priceFrom.toLocaleString('en-IN')}</p>
              </div>
              <div className="stat-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Duration</p>
                <p className="mt-2 font-display text-2xl text-slate-950">{service.durationHours ?? 'Flexible'} hrs</p>
              </div>
              <div className="stat-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Guest capacity</p>
                <p className="mt-2 font-display text-2xl text-slate-950">{service.guestCapacity ?? 'Custom'}</p>
              </div>
            </div>
          </div>
          <div className="panel">
            <h2 className="font-display text-3xl tracking-tight">Client reviews</h2>
            <div className="mt-6 grid gap-4">
              {reviewData?.serviceReviews?.length ? (
                reviewData.serviceReviews.map((review: { id: string; rating: number; comment?: string; user: { fullName: string }; createdAt: string }) => (
                  <div key={review.id} className="rounded-[24px] border border-rose-100 bg-rose-50/60 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{review.user.fullName}</p>
                      <p className="text-sm text-rose-600">{review.rating} / 5</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment ?? 'No written feedback provided.'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Reviews will appear here after completed bookings.</p>
              )}
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="panel sticky top-28">
            <p className="pill">Partner spotlight</p>
            <h2 className="mt-4 font-display text-3xl tracking-tight">{service.vendor.businessName}</h2>
            <p className="mt-3 text-sm text-slate-600">{service.vendor.description ?? 'Verified partner on Happylokam.'}</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] bg-rose-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Location</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {service.city}
                  {service.state ? `, ${service.state}` : ''}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                <ServiceActionPanel service={service} />
                <div className="mt-4 flex gap-3">
                  <Link href="/dashboard/user" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                    Open dashboard
                  </Link>
                  <Link href={`/vendors/${service.vendor.slug ?? service.vendor.id}`} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
                    Partner profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function PartnerDetailView({ vendorId }: { vendorId: string }) {
  const { data, loading } = useQuery(VENDOR_PROFILE_QUERY, {
    variables: { vendorId }
  });

  const vendor = data?.fetchVendorProfile;

  const { data: serviceData } = useQuery(FETCH_SERVICES_QUERY, {
    variables: {
      filter: {}
    }
  });

  const vendorServices =
    serviceData?.fetchServices?.filter(
      (service: { vendor: { id: string; slug?: string } }) =>
        service.vendor.id === vendor?.id || service.vendor.slug === vendorId
    ) ?? [];

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Skeleton className="min-h-[320px] rounded-[36px]" />
          <Skeleton className="min-h-[320px] rounded-[36px]" />
        </div>
      </section>
    );
  }

  if (!vendor) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-slate-500">Partner profile not found.</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="panel bg-[linear-gradient(180deg,rgba(255,241,245,1),rgba(255,255,255,1))]">
          <span className="pill">{vendor.isVerified ? 'Verified partner' : 'Marketplace partner'}</span>
          <h1 className="mt-5 font-display text-4xl tracking-tight text-slate-950 md:text-6xl">{vendor.businessName}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{vendor.description ?? 'Premium event production and hospitality partner.'}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {vendor.city}
                {vendor.state ? `, ${vendor.state}` : ''}
              </p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Rating</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{vendor.ratingAverage.toFixed(1)} / 5</p>
            </div>
            <div className="stat-tile">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Reviews</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{vendor.totalReviews}</p>
            </div>
          </div>
        </div>
        <div className="panel">
          <h2 className="font-display text-3xl tracking-tight">Availability windows</h2>
          <div className="mt-6 space-y-3">
            {vendor.availability?.length ? (
              vendor.availability.map((slot: { id: string; startAt: string; endAt: string; label?: string }) => (
                <div key={slot.id} className="rounded-[24px] border border-rose-100 bg-rose-50/60 p-5">
                  <p className="text-sm font-semibold text-slate-900">{slot.label ?? 'Open slot'}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(slot.startAt).toLocaleString()} to {new Date(slot.endAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Availability will appear here once the partner publishes slots.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-display text-3xl tracking-tight text-slate-950">Published experiences</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {vendorServices.length ? (
            vendorServices.map((service: { id: string; title: string; summary: string; slug: string; priceFrom: number }) => (
              <div key={service.id} className="panel">
                <h3 className="font-display text-2xl tracking-tight">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.summary}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-rose-700">Rs. {service.priceFrom.toLocaleString('en-IN')}</span>
                  <Link href={`/services/${service.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                    View service
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No published services found for this partner yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
