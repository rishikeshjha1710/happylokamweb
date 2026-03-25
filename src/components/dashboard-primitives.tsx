'use client';

import { ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  accent: string;
  icon: ReactNode;
  badge?: string;
};

type InsightPanelProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  children: ReactNode;
  className?: string;
};

type ChartDatum = {
  label: string;
  value: number;
  tone?: string;
};

type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  badge?: string;
};

export function MetricCard({ label, value, hint, accent, icon, badge }: MetricCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>{icon}</div>
        {badge ? <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">{badge}</span> : null}
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

export function InsightPanel({ eyebrow, title, copy, children, className = '' }: InsightPanelProps) {
  return (
    <section className={`rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-3 font-display text-3xl tracking-tight text-slate-950">{title}</h3>
      {copy ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{copy}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function TrendChart({
  data,
  color,
  metricLabel,
  metricValue
}: {
  data: ChartDatum[];
  color: string;
  metricLabel: string;
  metricValue: string;
}) {
  const width = 300;
  const height = 120;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - (item.value / maxValue) * (height - 18) - 9;
      return `${x},${y}`;
    })
    .join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{metricLabel}</p>
          <p className="mt-3 font-display text-4xl tracking-tight">{metricValue}</p>
        </div>
        <div className="rounded-full border border-white/12 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
          {data.length} points
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-6 h-36 w-full overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${color.replace(/[^a-z0-9]/gi, '')})`}
          stroke="none"
          points={fillPoints}
        />
        <polyline fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
      </svg>
      <div className="mt-4 grid grid-cols-6 gap-2 text-[11px] uppercase tracking-[0.16em] text-white/50">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DistributionDonut({
  title,
  items,
  centerLabel,
  centerValue
}: {
  title: string;
  items: ChartDatum[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = items
    .map((item) => {
      const start = total === 0 ? 0 : (cursor / total) * 360;
      cursor += item.value;
      const end = total === 0 ? 0 : (cursor / total) * 360;
      return `${item.tone ?? '#0f172a'} ${start}deg ${end}deg`;
    })
    .join(', ');

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Distribution</p>
          <h4 className="mt-3 font-display text-2xl tracking-tight text-slate-950">{title}</h4>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {total} total
        </span>
      </div>
      <div className="mt-6 grid items-center gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex justify-center">
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${gradient || '#e2e8f0 0deg 360deg'})`
            }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{centerLabel}</span>
              <span className="mt-2 font-display text-2xl tracking-tight text-slate-950">{centerValue}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.tone ?? '#0f172a' }} />
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${total === 0 ? 0 : (item.value / total) * 100}%`,
                    backgroundColor: item.tone ?? '#0f172a'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RankedBars({
  title,
  items,
  formatter
}: {
  title: string;
  items: ChartDatum[];
  formatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <h4 className="font-display text-2xl tracking-tight text-slate-950">{title}</h4>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm font-semibold text-slate-600">{formatter ? formatter(item.value) : item.value}</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.tone ?? 'linear-gradient(90deg,#06b6d4,#0f172a)'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterTabs({
  options,
  value,
  onChange
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
            option.value === value ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ActivityTimeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <h4 className="font-display text-2xl tracking-tight text-slate-950">{title}</h4>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-3 w-3 rounded-full bg-cyan-500" />
              <span className="mt-2 h-full w-px bg-slate-200" />
            </div>
            <div className="flex-1 rounded-[22px] border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{item.title}</p>
                {item.badge ? (
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-slate-200/60 ${className}`} />
  );
}

export function PremiumLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 animate-[bounce_1s_infinite] rounded-full bg-rose-500 [animation-delay:-0.28s]" />
        <span className="h-2.5 w-2.5 animate-[bounce_1s_infinite] rounded-full bg-rose-500 [animation-delay:-0.14s]" />
        <span className="h-2.5 w-2.5 animate-[bounce_1s_infinite] rounded-full bg-rose-500" />
      </span>
    </div>
  );
}

export function TermsModal({
  isOpen,
  onAccept,
  onClose,
  title = 'Service Guidelines',
  content
}: {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
  title?: string;
  content: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 px-6 backdrop-blur-md">
      <div className="w-full max-w-2xl animate-slide-up rounded-[40px] border border-white/20 bg-white p-8 shadow-2xl md:p-12">
        <div className="flex flex-col">
          <span className="pill w-fit">Mandatory Review</span>
          <h3 className="mt-6 font-display text-3xl tracking-tight text-slate-950 md:text-4xl">{title}</h3>
          <div className="mt-8 max-h-[300px] overflow-y-auto rounded-3xl border border-rose-100 bg-rose-50/30 p-6">
            <div className="prose prose-sm prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">{content}</p>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onAccept}
              className="flex-1 rounded-2xl bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(225,29,72,0.2)] transition hover:bg-rose-500"
            >
              Accept & Continue
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-8 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PremiumAlert({
  title,
  message,
  type = 'info',
  onClose
}: {
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}) {
  const themes = {
    success: {
      shell: 'border-emerald-100 bg-white text-emerald-700',
      icon: 'bg-emerald-50 text-emerald-600'
    },
    info: {
      shell: 'border-sky-100 bg-white text-sky-700',
      icon: 'bg-sky-50 text-sky-600'
    },
    error: {
      shell: 'border-red-100 bg-white text-red-700',
      icon: 'bg-red-50 text-red-600'
    }
  };

  const icon = type === 'success' ? <CheckCircle2 className="h-7 w-7" /> : type === 'error' ? <TriangleAlert className="h-7 w-7" /> : <Info className="h-7 w-7" />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 px-6 backdrop-blur-sm">
      <div className={`w-full max-w-sm animate-slide-up rounded-[32px] border p-8 shadow-[0_40px_120px_rgba(15,23,42,0.18)] ${themes[type].shell}`}>
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${themes[type].icon} shadow-sm ring-1 ring-black/5`}>
            {icon}
          </div>
          <h3 className="mt-6 font-display text-2xl tracking-tight text-slate-950">{title}</h3>
          <p className="mt-3 text-sm leading-6 opacity-80">{message}</p>
          <button
            onClick={onClose}
            className="mt-8 w-full rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
