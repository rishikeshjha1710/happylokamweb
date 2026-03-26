'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Filter, Search, TrendingUp, Users, Wallet } from 'lucide-react';
import { MarketplaceImage } from './marketplace-image';

// --- Types ---

type DataPoint = {
  label: string;
  value: number;
  secondaryValue?: number;
};

type AdvancedFilterProps = {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  cities: string[];
  statuses: string[];
  onExport?: () => void;
  exportLabel?: string;
};

// --- Components ---

/**
 * A ultra-premium dual-series area chart using pure SVG.
 * Shows 'Focus Metric' (e.g. Revenue) and 'Context Metric' (e.g. Bookings).
 */
export function PerformancePulse({ 
  data, 
  title, 
  height = 200, 
  colorMain = '#e11d48', 
  colorSecondary = '#94a3b8',
  mainLabel = 'Primary',
  secondaryLabel = 'Volume'
}: { 
  data: DataPoint[]; 
  title: string; 
  height?: number;
  colorMain?: string;
  colorSecondary?: string;
  mainLabel?: string;
  secondaryLabel?: string;
}) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const maxSecondary = useMemo(() => Math.max(...data.map(d => d.secondaryValue ?? 0), 1), [data]);
  
  const width = 800;
  const padding = 20;
  
  const pointsMain = useMemo(() => {
    if (data.length === 0) {
      return `${padding},${height - padding} ${width - padding},${height - padding}`;
    }

    return data.map((d, i) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - (d.value / maxValue) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
  }, [data, maxValue, height]);

  const pointsSecondary = useMemo(() => {
    if (data.length === 0) {
      return `${padding},${height - padding} ${width - padding},${height - padding}`;
    }

    return data.map((d, i) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((d.secondaryValue ?? 0) / maxSecondary) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
  }, [data, maxSecondary, height]);

  return (
    <div className="panel overflow-hidden border-rose-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h4 className="font-display text-lg font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">Real-time performance distribution</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMain }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{mainLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colorSecondary }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{secondaryLabel}</span>
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
          {/* Secondary Area */}
          <path
            d={`M ${padding},${height} L ${pointsSecondary} L ${width - padding},${height} Z`}
            fill={colorSecondary}
            fillOpacity="0.1"
          />
          <path
            d={`M ${padding},${pointsSecondary.split(' ')[0].split(',')[1]} L ${pointsSecondary}`}
            fill="none"
            stroke={colorSecondary}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Main Area */}
          <defs>
            <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorMain} stopOpacity="0.2" />
              <stop offset="100%" stopColor={colorMain} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${padding},${height} L ${pointsMain} L ${width - padding},${height} Z`}
            fill="url(#mainGradient)"
          />
          <path
            d={`M ${padding},${pointsMain.split(' ')[0].split(',')[1]} L ${pointsMain}`}
            fill="none"
            stroke={colorMain}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data Nodes */}
          {data.map((d, i) => {
             const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
             const y = height - (d.value / maxValue) * (height - padding * 2) - padding;
             return (
               <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={colorMain} strokeWidth="2" className="transition-all hover:r-6 cursor-pointer" />
             );
          })}
        </svg>
      </div>
      
      <div className="mt-4 flex justify-between border-t border-slate-50 pt-4">
        {data.filter((_, i) => i % 2 === 0).map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Advanced Filter Bar with search, city multi-select, and status quick-toggles.
 */
export function GlobalControls({ 
  onSearch, 
  onFilterChange, 
  cities, 
  statuses,
  onExport,
  exportLabel = 'Export Insights'
}: AdvancedFilterProps) {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  return (
    <div className="panel flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 ring-1 ring-slate-200/50">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Command search across entities..."
          className="w-full rounded-2xl border-none bg-white py-3 pl-11 pr-4 text-sm shadow-sm ring-1 ring-slate-200 transition focus:ring-rose-500"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last 30 Days</span>
          <ChevronDown className="h-3 w-3" />
        </label>

        <select 
          className="rounded-2xl border-none bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition focus:ring-rose-500"
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            onFilterChange({ city: e.target.value, status: activeStatus });
          }}
        >
          <option value="ALL">All Regions</option>
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      <div className="h-8 w-px bg-slate-200 hidden md:block" />

      <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
        {['ALL', ...statuses].map((status) => (
          <button
            key={status}
            onClick={() => {
              setActiveStatus(status);
              onFilterChange({ city: selectedCity, status });
            }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeStatus === status 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      
      <button
        type="button"
        onClick={onExport}
        disabled={!onExport}
        className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-55"
      >
        <Filter className="h-3.5 w-3.5" />
        <span>{exportLabel}</span>
      </button>
    </div>
  );
}

/**
 * Role-Based Profile Controller
 */
export function ProfileExecutive({ 
  user, 
  role 
}: { 
  user: {
    fullName?: string | null;
    email?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
  role: 'ADMIN' | 'PARTNER' | 'USER' 
}) {
  const title = user.fullName?.trim() || 'Profile';
  const hasAvatar = Boolean(user.avatarUrl?.trim());

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-6">
        <div className="panel border-rose-100 bg-white p-8 text-center ring-1 ring-rose-50">
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[48px] border border-rose-100 bg-[linear-gradient(135deg,#be123c,#f43f5e)] text-4xl font-bold text-white shadow-2xl">
            {hasAvatar ? (
              <MarketplaceImage
                src={user.avatarUrl}
                alt={title}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span>{title.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h3 className="mt-6 font-display text-2xl font-bold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 font-medium">{role === 'PARTNER' ? 'Business Partner' : role === 'ADMIN' ? 'Site Administrator' : 'Platform Member'}</p>
          <div className="mt-6 flex justify-center gap-2">
             <span className="pill bg-rose-50 text-rose-700 border-rose-100">Verified Identity</span>
          </div>
        </div>

        <div className="panel bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
           <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-400">Security Pulse</p>
           <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Account Integrity</span>
                <span className="font-bold text-emerald-400">Stable</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Session Access</span>
                <span className="font-bold text-rose-300">Protected</span>
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <button className="w-full rounded-2xl bg-white/10 py-3 text-xs font-bold transition hover:bg-white/20">Rotate Password</button>
              </div>
           </div>
        </div>
      </div>

      <div className="panel border-slate-200 bg-white p-8">
        <div className="mb-8 flex items-center justify-between">
          <h4 className="font-display text-2xl font-bold text-slate-950">Identity & Operations</h4>
          <button className="rounded-full bg-rose-50 px-6 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100">Commit Changes</button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Legal Full Name</p>
              <input 
                value={user.fullName ?? ''} 
                className="w-full rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-semibold transition focus:ring-rose-500"
                readOnly
              />
           </div>
           <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Communication Email</p>
              <input 
                value={user.email ?? user.username ?? ''} 
                className="w-full rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-semibold text-slate-400"
                disabled
              />
           </div>

           {role === 'PARTNER' && (
             <>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Commercial Business Name</p>
                  <input 
                    placeholder="Enter business entity name"
                    className="w-full rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-semibold transition focus:ring-rose-500"
                  />
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Regional Operation (City)</p>
                  <input 
                    placeholder="Operation Headquarters"
                    className="w-full rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-semibold transition focus:ring-rose-500"
                  />
               </div>
               <div className="md:col-span-2 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Bank Settlement Details (Confidential)</p>
                  <div className="flex gap-3">
                     <input 
                       placeholder="Account Number" 
                       type="password"
                       className="flex-1 rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-mono tracking-widest"
                     />
                     <input 
                       placeholder="IFSC / Branch Code" 
                       className="w-40 rounded-2xl border-slate-100 px-4 py-3.5 text-sm font-bold uppercase"
                     />
                  </div>
               </div>
             </>
           )}

           {role === 'USER' && (
             <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-50">
                <p className="text-sm font-medium text-slate-600">Preferences & Celebration Profile</p>
                <div className="mt-4 flex flex-wrap gap-2">
                   {['Weddings', 'Birthdays', 'Corporate Events', 'Festivals'].map(tag => (
                     <span key={tag} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-all">{tag}</span>
                   ))}
                   <button className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-400 hover:border-rose-400 hover:text-rose-500">+ Add Interest</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
