'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADMIN_ANALYTICS_QUERY,
  ADMIN_ARCHIVE_SERVICE_MUTATION,
  ADMIN_CREATE_SERVICE_MUTATION,
  ADMIN_SERVICES_QUERY,
  ADMIN_UPDATE_SERVICE_MUTATION,
  ADMIN_USERS_QUERY,
  ADMIN_VENDORS_QUERY,
  APPROVE_SERVICE_MUTATION,
  CREATE_VENDOR_ACCOUNT_MUTATION,
  SERVICE_CATEGORIES_QUERY
} from '@/graphql/queries';
import { fileToDataUrl } from '@/lib/media';
import { MarketplaceImage } from './marketplace-image';
import { PremiumAlert } from './dashboard-primitives';

type PartnerSummary = {
  id: string;
  businessName: string;
  avatarUrl?: string | null;
  city: string;
  state?: string | null;
  approvalStatus: string;
  owner: {
    fullName: string;
    email?: string | null;
  };
};

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

type ServiceSummary = {
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
  totalReviews: number;
  ratingAverage: number;
  updatedAt: string;
  vendor: {
    id: string;
    businessName: string;
    approvalStatus: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

function InlineNotice({ message }: { message: string | null }) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message && message !== dismissedMessage) {
      setDismissedMessage(null);
    }
  }, [dismissedMessage, message]);

  if (!message) {
    return null;
  }

  if (dismissedMessage === message) {
    return null;
  }

  const type = /failed|error|invalid|not found/i.test(message) ? 'error' : 'success';

  return (
    <PremiumAlert
      title={type === 'error' ? 'Action needs attention' : 'Update complete'}
      message={message}
      type={type}
      onClose={() => setDismissedMessage(message)}
    />
  );
}

function ImagePreview({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  return (
    <div className="relative h-48 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950/95">
      <MarketplaceImage
        src={imageUrl}
        alt={title}
        fill
        sizes="(min-width: 1280px) 28rem, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function validateAdminServiceInput({
  title,
  summary,
  description,
  priceFrom,
  city
}: {
  title: string;
  summary: string;
  description: string;
  priceFrom: string;
  city: string;
}) {
  if (title.trim().length < 3) {
    return 'Service title must be at least 3 characters.';
  }

  if (summary.trim().length < 20) {
    return 'Service summary must be at least 20 characters.';
  }

  if (description.trim().length < 40) {
    return 'Service description must be at least 40 characters.';
  }

  if (!priceFrom || Number(priceFrom) < 1) {
    return 'Please enter a valid starting price.';
  }

  if (!city.trim()) {
    return 'Please enter the operating city.';
  }

  return null;
}

function ToolSection({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">{eyebrow}</p>
      <h3 className="mt-3 font-display text-3xl tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{copy}</p>
    </div>
  );
}

export function AdminPartnerOnboardingManager() {
  const { data } = useQuery(ADMIN_VENDORS_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    businessName: '',
    city: '',
    state: ''
  });

  const [createVendor, createState] = useMutation(CREATE_VENDOR_ACCOUNT_MUTATION, {
    refetchQueries: [{ query: ADMIN_VENDORS_QUERY }, { query: ADMIN_ANALYTICS_QUERY }, { query: ADMIN_USERS_QUERY }]
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createVendor({
        variables: {
          input: {
            ...form,
            username: form.username || undefined,
            phone: form.phone || undefined,
            state: form.state || undefined,
            role: 'VENDOR'
          }
        }
      });

      const vendor = result.data?.createVendorAccount;
      setForm({
        fullName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        businessName: '',
        city: '',
        state: ''
      });
      setMessage(`Vendor ${vendor?.businessName ?? ''} onboarded and approved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Vendor onboarding failed.');
    }
  }

  const recentPartners = (data?.adminVendors ?? []).slice(0, 4) as PartnerSummary[];

  return (
    <div className="panel border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))]">
      <ToolSection
        eyebrow="Partner onboarding"
        title="Register and activate new partners from the admin room."
        copy="Operations teams can create partner accounts directly, approve them instantly, and hand over a ready-to-use business profile without sending people through separate setup flows."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200/80">Live capacity</p>
          <p className="mt-4 font-display text-4xl tracking-tight">{data?.adminVendors?.length ?? 0}</p>
          <p className="mt-3 text-sm leading-7 text-white/72">Approved vendors onboarded into the marketplace and ready for admin oversight.</p>
          <div className="mt-6 space-y-3">
            {recentPartners.map((vendor) => (
              <div key={vendor.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                    <MarketplaceImage
                      src={vendor.avatarUrl}
                      alt={vendor.businessName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{vendor.businessName}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {vendor.owner.fullName} • {vendor.city}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-rose-200/85">{vendor.approvalStatus}</p>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Owner full name"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Owner email"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="Username"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Temporary password"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
          />
          <input
            required
            value={form.businessName}
            onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
            placeholder="Business name"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            required
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="City"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.state}
            onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            placeholder="State"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
          />
          <button
            type="submit"
            disabled={createState.loading}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white md:col-span-2"
          >
            {createState.loading ? 'Creating partner...' : 'Create and approve partner'}
          </button>
          <div className="md:col-span-2">
            <InlineNotice message={message} />
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminServicesManager() {
  const { data: categoriesData } = useQuery(SERVICE_CATEGORIES_QUERY);
  const { data: vendorsData } = useQuery(ADMIN_VENDORS_QUERY);
  const { data: servicesData } = useQuery(ADMIN_SERVICES_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState({
    vendorId: '',
    title: '',
    summary: '',
    description: '',
    categorySlug: '',
    priceFrom: '',
    city: '',
    state: '',
    durationHours: '',
    guestCapacity: '',
    coverImageUrl: '',
    status: 'DRAFT'
  });

  const categories = (categoriesData?.serviceCategories ?? []) as CategorySummary[];
  const partners = (vendorsData?.adminVendors ?? []) as PartnerSummary[];
  const services = (servicesData?.adminServices ?? []) as ServiceSummary[];

  useEffect(() => {
    if (!form.categorySlug && categories[0]?.slug) {
      setForm((current) => ({ ...current, categorySlug: categories[0].slug }));
    }
  }, [categories, form.categorySlug]);

  useEffect(() => {
    if (!form.vendorId && partners[0]?.id) {
      setForm((current) => ({ ...current, vendorId: partners[0].id }));
    }
  }, [form.vendorId, partners]);

  useEffect(() => {
    if (!selectedServiceId) {
      return;
    }

    const service = services.find((entry) => entry.id === selectedServiceId);
    if (!service) {
      return;
    }

    setForm({
      vendorId: service.vendor.id,
      title: service.title,
      summary: service.summary,
      description: service.description,
      categorySlug: service.category.slug,
      priceFrom: String(service.priceFrom),
      city: service.city,
      state: service.state ?? '',
      durationHours: service.durationHours ? String(service.durationHours) : '',
      guestCapacity: service.guestCapacity ? String(service.guestCapacity) : '',
      coverImageUrl: service.coverImageUrl ?? '',
      status: service.status
    });
  }, [selectedServiceId, services]);

  const [createService, createState] = useMutation(ADMIN_CREATE_SERVICE_MUTATION, {
    refetchQueries: [{ query: ADMIN_SERVICES_QUERY }, { query: ADMIN_ANALYTICS_QUERY }]
  });
  const [updateService, updateState] = useMutation(ADMIN_UPDATE_SERVICE_MUTATION, {
    refetchQueries: [{ query: ADMIN_SERVICES_QUERY }]
  });
  const [archiveService, archiveState] = useMutation(ADMIN_ARCHIVE_SERVICE_MUTATION, {
    refetchQueries: [{ query: ADMIN_SERVICES_QUERY }, { query: ADMIN_ANALYTICS_QUERY }]
  });
  const [approveService, approveState] = useMutation(APPROVE_SERVICE_MUTATION, {
    refetchQueries: [{ query: ADMIN_SERVICES_QUERY }]
  });

  const filteredServices = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
      const matchesVendor = vendorFilter === 'ALL' || service.vendor.id === vendorFilter;
      const matchesQuery =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.vendor.businessName.toLowerCase().includes(query) ||
        service.city.toLowerCase().includes(query) ||
        service.category.name.toLowerCase().includes(query);

      return matchesStatus && matchesVendor && matchesQuery;
    });
  }, [deferredSearch, services, statusFilter, vendorFilter]);

  function resetForm() {
    setSelectedServiceId(null);
    setForm({
      vendorId: partners[0]?.id ?? '',
      title: '',
      summary: '',
      description: '',
      categorySlug: categories[0]?.slug ?? '',
      priceFrom: '',
      city: '',
      state: '',
      durationHours: '',
      guestCapacity: '',
      coverImageUrl: '',
      status: 'DRAFT'
    });
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const image = await fileToDataUrl(file);
      setForm((current) => ({ ...current, coverImageUrl: image }));
      setMessage('Cover image selected successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateAdminServiceInput({
      title: form.title,
      summary: form.summary,
      description: form.description,
      priceFrom: form.priceFrom,
      city: form.city
    });

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const payload = {
      title: form.title,
      summary: form.summary,
      description: form.description,
      categorySlug: form.categorySlug,
      priceFrom: Number(form.priceFrom),
      city: form.city,
      state: form.state || undefined,
      durationHours: form.durationHours ? Number(form.durationHours) : undefined,
      guestCapacity: form.guestCapacity ? Number(form.guestCapacity) : undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      status: form.status
    };

    try {
      if (selectedServiceId) {
        await updateService({
          variables: {
            input: {
              serviceId: selectedServiceId,
              ...payload
            }
          }
        });
        setMessage('Service updated from admin control.');
      } else {
        await createService({
          variables: {
            vendorId: form.vendorId,
            input: payload
          }
        });
        setMessage('Vendor service created from admin control.');
      }

      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Service save failed.');
    }
  }

  async function handleArchive(serviceId: string) {
    try {
      await archiveService({
        variables: {
          serviceId
        }
      });

      if (selectedServiceId === serviceId) {
        resetForm();
      }
      setMessage('Service archived.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Service archive failed.');
    }
  }

  async function handleApprove(serviceId: string, status: string) {
    try {
      await approveService({
        variables: {
          serviceId,
          status
        }
      });
      setMessage(`Service ${status === 'APPROVED' ? 'approved' : 'rejected'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Approval failed.');
    }
  }

  return (
    <div className="panel border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))]">
      <ToolSection
        eyebrow="Service command"
        title="Create, refine, and archive partner inventory from one service control tower."
        copy="Admin operators can step into listing quality control, stand up new partner offerings, fix weak copy, and take stale inventory out of the storefront without leaving the dashboard."
      />
      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">{selectedServiceId ? 'Edit listing' : 'New listing'}</p>
              <h4 className="mt-2 font-display text-2xl tracking-tight text-slate-950">
                {selectedServiceId ? 'Adjust partner service details' : 'Create a partner service'}
              </h4>
            </div>
            {selectedServiceId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                New service
              </button>
            ) : null}
          </div>
          <div className="mt-5">
            <ImagePreview title={form.title || 'Marketplace service preview'} imageUrl={form.coverImageUrl} />
          </div>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
            <select
              value={form.vendorId}
              onChange={(event) => setForm((current) => ({ ...current, vendorId: event.target.value }))}
              disabled={Boolean(selectedServiceId)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
            >
              {partners.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.businessName} • {vendor.city}
                </option>
              ))}
            </select>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Service title"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
            />
            <textarea
              required
              rows={2}
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              placeholder="Summary"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <select
              value={form.categorySlug}
              onChange={(event) => setForm((current) => ({ ...current, categorySlug: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              {['DRAFT', 'PUBLISHED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min={1}
              value={form.priceFrom}
              onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))}
              placeholder="Price from"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              required
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="City"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
              placeholder="State"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="number"
              min={1}
              value={form.durationHours}
              onChange={(event) => setForm((current) => ({ ...current, durationHours: event.target.value }))}
              placeholder="Duration hours"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="number"
              min={1}
              value={form.guestCapacity}
              onChange={(event) => setForm((current) => ({ ...current, guestCapacity: event.target.value }))}
              placeholder="Guest capacity"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Cover image upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:font-semibold file:text-rose-700"
              />
              {form.coverImageUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, coverImageUrl: '' }))}
                  className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700"
                >
                  Remove cover image
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={createState.loading || updateState.loading}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white md:col-span-2"
            >
              {createState.loading || updateState.loading ? 'Saving service...' : selectedServiceId ? 'Save service changes' : 'Create service'}
            </button>
          </form>
          <div className="mt-4">
            <InlineNotice message={message} />
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200/78">Live inventory</p>
              <h4 className="mt-2 font-display text-2xl tracking-tight">Marketplace services</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    statusFilter === value ? 'bg-rose-400 text-slate-950' : 'border border-white/15 text-white/78'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_0.8fr]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search service, city, partner, or category"
              className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white"
            />
            <select
              value={vendorFilter}
              onChange={(event) => setVendorFilter(event.target.value)}
              className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white"
            >
              <option value="ALL">All partners</option>
              {partners.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.businessName}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {filteredServices.map((service) => (
              <div key={service.id} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{service.title}</p>
                    <p className="mt-1 text-sm text-white/72">
                      {service.vendor.businessName} • {service.category.name} • {service.city}
                    </p>
                    <p className="mt-3 text-sm text-white/74">{service.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-200">Rs. {service.priceFrom.toLocaleString('en-IN')}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/58">{service.status}</p>
                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.15em] ${
                      service.approvalStatus === 'APPROVED' ? 'text-emerald-400' : 
                      service.approvalStatus === 'REJECTED' ? 'text-red-400' : 
                      'text-amber-400'
                    }`}>
                      {service.approvalStatus}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setMessage(null);
                    }}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Edit service
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchive(service.id)}
                    disabled={archiveState.loading}
                    className="rounded-full border border-white/18 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {archiveState.loading ? 'Archiving...' : 'Archive'}
                  </button>
                  {service.approvalStatus !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(service.id, 'APPROVED')}
                      disabled={approveState.loading}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {approveState.loading ? 'Wait...' : 'Approve'}
                    </button>
                  )}
                  {service.approvalStatus === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(service.id, 'REJECTED')}
                      disabled={approveState.loading}
                      className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {approveState.loading ? 'Wait...' : 'Reject'}
                    </button>
                  )}
                  <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">
                    {service.totalReviews} reviews • {service.ratingAverage.toFixed(1)} rating
                  </span>
                </div>
              </div>
            ))}
            {!filteredServices.length ? <p className="text-sm text-white/70">No services match the selected filters right now.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
