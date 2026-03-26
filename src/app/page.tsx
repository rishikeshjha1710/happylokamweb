import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CalendarRange, LayoutDashboard, ShieldCheck, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { PublicServiceGrid } from '@/components/public-service-grid';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://happylokam.com';

export const metadata: Metadata = {
  title: 'Happylokam | Event Booking, Celebration Planning, and Partner Marketplace',
  description:
    'Discover trusted celebration partners, browse premium event services, and book faster with Happylokam.',
  keywords: [
    'Happylokam',
    'event booking',
    'celebration planning',
    'party vendors',
    'wedding services',
    'partner marketplace',
    'event management',
    'secure bookings'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Happylokam | Event Booking and Celebration Planning',
    description:
      'Discover trusted celebration partners, browse premium event services, and book faster with Happylokam.',
    url: siteOrigin,
    siteName: 'Happylokam',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Happylokam event booking platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happylokam | Event Booking, Celebration Planning, and Partner Marketplace',
    description:
      'Discover trusted celebration partners, browse premium event services, and book faster with Happylokam.',
    images: ['/og-image.svg']
  }
};

const roleJourneys = [
  {
    title: 'Celebrate',
    copy: 'Find the perfect setting and services for your special day. We make the struggle of searching and booking a thing of the past.',
    href: '/signup?role=USER',
    action: 'Plan your celebration',
    accent: 'bg-[linear-gradient(180deg,#fff1f2,#ffe4e6)]'
  },
  {
    title: 'Partners',
    copy: 'Grow your business by showcasing your amazing services to families and organizers looking for quality and trust.',
    href: '/signup?role=VENDOR',
    action: 'Become a partner',
    accent: 'bg-[linear-gradient(180deg,#fff1f2,#ffe4e6)]'
  },
  {
    title: 'Community',
    copy: 'We ensure every booking is handled with care, providing a safe and joyful environment for everyone involved.',
    href: '/login?role=USER',
    action: 'Help center',
    accent: 'bg-[linear-gradient(180deg,#fff7f8,#fff1f2)]'
  }
];

const platformPillars = [
  {
    title: 'Fast Booking',
    copy: 'Get your celebration confirmed in minutes, not days. We value your time because moments wait for no one.',
    icon: CalendarRange
  },
  {
    title: 'Genuine Trust',
    copy: 'Verified partners and thousands of happy reviews ensure your celebration is in safe, professional hands.',
    icon: ShieldCheck
  },
  {
    title: 'Smart Spaces',
    copy: 'Manage your guest lists, schedules, and service details in one easy-to-use personal workspace.',
    icon: LayoutDashboard
  }
];

const experienceStrip = [
  'Celebration is free for every family',
  'No more struggle in festival booking',
  'Instant connection with verified partners',
  'Crafting joyful memories together'
];

export default function HomePage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Happylokam',
      url: siteOrigin,
      logo: `${siteOrigin}/favicon.svg`,
      description:
        'Premium event booking and celebration platform for users, partners, and admins with fast discovery and secure bookings.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Happylokam',
      url: siteOrigin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/explore?query={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pb-20 pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Celebration Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Celebrate with ease and joy
            </span>
            <h1 className="mt-8 max-w-5xl animate-slide-up font-display text-5xl font-bold tracking-tight text-white md:text-8xl">
              Enjoy Every <span className="text-rose-600">Moment</span> of your life.
            </h1>
            <p className="mt-8 max-w-2xl animate-slide-up text-lg leading-8 text-white/70 [animation-delay:200ms]">
              Because celebration should be free of stress. We bridge the gap between your dreams and your big day with fast, reliable, and beautiful planning.
            </p>
            <div className="mt-10 flex animate-slide-up flex-wrap items-center justify-center gap-4 [animation-delay:400ms]">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(225,29,72,0.4)] transition-all hover:scale-105 hover:bg-rose-500"
              >
                Start Exploring
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signup?role=PARTNER"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                Join as Partner
              </Link>
            </div>

            <div className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: 'Families Served', value: '10,000+' },
                { label: 'Verified Partners', value: '500+' },
                { label: 'Booking Speed', value: '< 2 mins' },
                { label: 'Customer Joy', value: '99.9%' }
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center border-l border-white/10 pl-8 text-left md:items-start">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                  <p className="mt-1 font-display text-xl text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-[linear-gradient(180deg,#fff1f2,#fff7f8)] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center mb-4">
          <span className="pill border-rose-200 bg-white text-rose-700">Quick Browse</span>
        </div>
        <PublicServiceGrid compact />
      </section>

      {/* Experience Strip */}
      <section className="bg-rose-600 py-4 overflow-hidden">
        <div className="mx-auto flex animate-scroll gap-12 whitespace-nowrap px-6">
          {experienceStrip.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <Star className="h-4 w-4 fill-white text-white" />
              <p className="text-sm font-bold uppercase tracking-widest text-white/90">{item}</p>
            </div>
          ))}
          {/* Duplicate for infinite loop effect */}
          {experienceStrip.map((item, i) => (
            <div key={i + 10} className="flex items-center gap-3">
              <Star className="h-4 w-4 fill-white text-white" />
              <p className="text-sm font-bold uppercase tracking-widest text-white/90">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-[radial-gradient(circle_at_top,#ffe4e6,transparent_48%),linear-gradient(180deg,#fff7f8,#ffffff)] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="pill border-rose-200 bg-white text-rose-700">About Our Mission</span>
            <h2 className="mt-6 font-display text-4xl tracking-tight text-slate-950 md:text-6xl">
              Helping You Celebrate <span className="text-rose-600">Freedom.</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              At Happylokam, our mission is to ensure that no family struggles to plan their moments of joy. We believe that festivals and family functions are for making memories, not managing stress.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              By connecting you with <strong className="font-semibold text-rose-700">verified partners</strong>, we guarantee quality, speed, and reliability for every event you plan on the platform.
            </p>
            
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {platformPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-[30px] border border-rose-100 bg-white p-6 shadow-[0_24px_70px_rgba(225,29,72,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_90px_rgba(225,29,72,0.14)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display text-lg text-slate-950">{pillar.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{pillar.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-[40px] bg-gradient-to-tr from-rose-500 to-rose-200 opacity-30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-rose-100 bg-white p-8 shadow-[0_28px_90px_rgba(225,29,72,0.12)]">
              <div className="relative h-80 overflow-hidden rounded-2xl">
                <Image src="/hero.png" alt="Celebration" fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-rose-600" />
                  <p className="text-sm font-semibold">Verified Service Partners</p>
                </div>
                <div className="flex items-center gap-3 text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-rose-600" />
                  <p className="text-sm font-semibold">Legally Registered & MCA Verified</p>
                </div>
                <div className="flex items-center gap-3 text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-rose-600" />
                  <p className="text-sm font-semibold">Trusted Since 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Legal & Trust Section */}
      <section className="border-y border-rose-100 bg-[linear-gradient(180deg,#fff1f2,#fff7f8)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-video overflow-hidden rounded-[40px] shadow-[0_28px_80px_rgba(225,29,72,0.14)]">
                 <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#500724,#881337)] p-8 text-center text-white">
                    <div>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h4 className="font-display text-2xl font-bold">Authenticated Operations</h4>
                        <p className="mt-4 text-slate-400">Our platform operates under strict legal guidelines, ensuring every transaction and booking is protected.</p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="pill border-rose-200 bg-white text-rose-700">Legal & Trust</span>
              <h2 className="mt-6 font-display text-4xl tracking-tight text-slate-950 md:text-5xl">
                A Registered & <span className="text-rose-600">Verified</span> Company.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Happylokam is a legally working entity, registered in the year <strong className="font-semibold text-slate-900">2026</strong> and <strong className="font-semibold text-rose-700">verified by MCA</strong>. We pride ourselves on transparency and legal integrity.
              </p>
              <div className="mt-8 flex items-start gap-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                   <h5 className="font-bold text-slate-900">MCA Verified Engagement</h5>
                   <p className="mt-1 text-sm text-slate-500">Operating within full compliance of national regulations to protect our users and partners.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Journeys */}
      <section id="journeys" className="bg-[linear-gradient(180deg,#ffffff,#fff7f8)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="pill border-rose-200 bg-white text-rose-700">Experience</span>
            <h2 className="mt-5 font-display text-4xl tracking-tight text-slate-950 md:text-5xl">
              Everyone is <span className="text-rose-600">Welcome.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {roleJourneys.map((journey) => (
              <div
                key={journey.title}
                className={`group rounded-[32px] border border-rose-100 p-8 shadow-[0_22px_70px_rgba(225,29,72,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_30px_100px_rgba(225,29,72,0.14)] ${journey.accent}`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-500">{journey.title}</p>
                <h3 className="mt-6 font-display text-3xl tracking-tight text-slate-950">{journey.title} Hub</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">{journey.copy}</p>
                <Link href={journey.href} className="mt-10 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                  {journey.action}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
