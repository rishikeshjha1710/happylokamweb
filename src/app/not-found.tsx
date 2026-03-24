import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="panel overflow-hidden bg-[linear-gradient(160deg,rgba(15,23,42,0.98),rgba(136,19,55,0.95))] text-white">
        <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
          404
        </span>
        <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">This page is not part of the current event map.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
          The route you opened does not exist right now. Head back to discovery or jump directly into your workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">
            Return home
          </Link>
          <Link href="/dashboard" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white">
            Open dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
