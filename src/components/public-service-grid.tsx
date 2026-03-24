'use client';

import { useQuery } from '@apollo/client';
import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { FETCH_SERVICES_QUERY, SERVICE_CATEGORIES_QUERY } from '@/graphql/queries';
import { SectionHeading } from './section-heading';
import { ServiceCard } from './service-card';
import { Skeleton } from './dashboard-primitives';

type PublicServiceGridProps = {
  compact?: boolean;
};

export function PublicServiceGrid({ compact = false }: PublicServiceGridProps) {
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const deferredSearch = useDeferredValue(search);

  const { data: categoryData } = useQuery(SERVICE_CATEGORIES_QUERY);
  const { data, loading, error } = useQuery(FETCH_SERVICES_QUERY, {
    variables: {
      filter: {
        city: city || undefined,
        categorySlug,
        search: deferredSearch || undefined
      }
    }
  });

  const services = data?.fetchServices ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Explore Discovery"
          title="Partner experiences designed to feel elite from the first click."
          description="Browse verified celebration partners, compare professional styles, and move to confirmed bookings with a secure MCA-level checkout path."
        />
        <div className="panel max-w-xl flex-1 p-4">
          <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services"
                className="w-full rounded-2xl border border-rose-100 bg-white px-11 py-3 text-sm outline-none ring-0 placeholder:text-slate-400"
              />
            </label>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Filter by city"
              className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategorySlug(undefined)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${!categorySlug ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}
            >
              All
            </button>
            {categoryData?.serviceCategories?.map((category: { id: string; slug: string; name: string }) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategorySlug(category.slug)}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${categorySlug === category.slug ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error ? (
        <p className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          We could not load the latest marketplace listings right now. Please refresh and try again.
        </p>
      ) : null}
      <div className={`mt-10 grid gap-6 ${compact ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
        {loading
          ? Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
              <div key={i} className="panel h-80 space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : services.slice(0, compact ? 3 : services.length).map((service: any) => <ServiceCard key={service.id} service={service} />)}
      </div>
      {!loading && !error && services.length === 0 ? (
        <div className="mt-8 rounded-[30px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Marketplace inventory</p>
          <h3 className="mt-4 font-display text-3xl tracking-tight text-slate-950">No live services match this search yet.</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">Try a different city or category to fetch the latest services from the database.</p>
        </div>
      ) : null}
    </section>
  );
}
