import Link from 'next/link';
import { MarketplaceImage } from './marketplace-image';

type ServiceCardProps = {
  service: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    priceFrom: number;
    city: string;
    coverImageUrl?: string | null;
    ratingAverage?: number;
    totalReviews?: number;
    vendor: {
      businessName: string;
      slug?: string;
    };
    category: {
      name: string;
      slug?: string;
    };
  };
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="relative h-60 overflow-hidden">
        <MarketplaceImage
          src={service.coverImageUrl}
          alt={service.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/0 to-transparent" />
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            {service.category.name}
          </span>
          <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            {service.city}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl tracking-tight text-slate-950">{service.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{service.vendor.businessName}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Starts at</p>
            <p className="font-display text-xl text-rose-700">Rs. {service.priceFrom.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{service.summary}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {service.ratingAverage ? `${service.ratingAverage.toFixed(1)} / 5` : 'Newly listed'} | {service.totalReviews ?? 0} reviews
          </div>
          <Link
            href={`/services/${service.slug}`}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
