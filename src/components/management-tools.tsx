'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADMIN_ANALYTICS_QUERY,
  ADMIN_BOOKINGS_QUERY,
  ADMIN_CMS_QUERY,
  ADMIN_PAYMENTS_QUERY,
  ADMIN_USERS_QUERY,
  ADMIN_VENDORS_QUERY,
  APPROVE_VENDOR_MUTATION,
  CANCEL_BOOKING_MUTATION,
  CREATE_BOOKING_MUTATION,
  CREATE_SERVICE_MUTATION,
  DELETE_SERVICE_MUTATION,
  FETCH_BOOKINGS_QUERY,
  INITIATE_PAYMENT_MUTATION,
  ME_QUERY,
  MY_VENDOR_PROFILE_QUERY,
  MY_VENDOR_SERVICES_QUERY,
  MY_WISHLIST_QUERY,
  MARK_PAYOUT_PAID_MUTATION,
  REQUEST_VENDOR_PAYOUT_MUTATION,
  RESCHEDULE_BOOKING_MUTATION,
  SET_USER_ACTIVE_STATUS_MUTATION,
  SERVICE_CATEGORIES_QUERY,
  SUBMIT_REVIEW_MUTATION,
  TOGGLE_WISHLIST_MUTATION,
  UPDATE_BOOKING_STATUS_MUTATION,
  UPDATE_PROFILE_MUTATION,
  UPDATE_SERVICE_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
  UPDATE_VENDOR_PROFILE_MUTATION,
  UPSERT_CMS_PAGE_MUTATION,
  UPSERT_VENDOR_AVAILABILITY_MUTATION,
  VERIFY_PAYMENT_MUTATION
} from '@/graphql/queries';
import { Activity, MessageSquareQuote, PackageCheck, CalendarDays, Store, CreditCard, UserCircle } from 'lucide-react';
import { getStoredRole } from '@/lib/auth';
import { MarketplaceImage } from './marketplace-image';
import { PremiumAlert, PremiumLoader, Skeleton, TermsModal } from './dashboard-primitives';

function MessageBanner({ message }: { message: string | null }) {
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

  const type = /failed|error|invalid|not found|expired/i.test(message) ? 'error' : /saved|updated|created|verified|paid|approved|submitted|activated|suspended|cancelled/i.test(message) ? 'success' : 'info';

  return (
    <PremiumAlert
      title={type === 'error' ? 'Action needs attention' : 'Update complete'}
      message={message}
      type={type}
      onClose={() => setDismissedMessage(message)}
    />
  );
}

function makePaymentId(reference?: string | null) {
  const suffix = (reference ?? 'local').replace(/[^a-zA-Z0-9_-]/g, '').slice(-16) || 'local';
  return `pay_local_${suffix}`;
}

function ServiceImagePreview({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  return (
    <div className="relative h-48 overflow-hidden rounded-[24px] border border-rose-100 bg-slate-950/95">
      <MarketplaceImage
        src={imageUrl}
        alt={title}
        fill
        sizes="(min-width: 768px) 32rem, 100vw"
        className="object-cover"
      />
    </div>
  );
}

type ServiceActionPanelProps = {
  service: {
    id: string;
    priceFrom: number;
  };
};

export function ServiceActionPanel({ service }: ServiceActionPanelProps) {
  const role = useMemo(() => getStoredRole(), []);
  const [message, setMessage] = useState<string | null>(null);
  const [latestBookingId, setLatestBookingId] = useState<string | null>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventDate: '',
    guestCount: '150',
    venue: '',
    notes: ''
  });

  const [toggleWishlist, wishlistState] = useMutation(TOGGLE_WISHLIST_MUTATION, {
    refetchQueries: [{ query: MY_WISHLIST_QUERY }]
  });
  const [createBooking, createBookingState] = useMutation(CREATE_BOOKING_MUTATION, {
    refetchQueries: [{ query: FETCH_BOOKINGS_QUERY }]
  });
  const [initiatePayment, initiateState] = useMutation(INITIATE_PAYMENT_MUTATION, {
    refetchQueries: [{ query: FETCH_BOOKINGS_QUERY }]
  });
  const [verifyPayment, verifyState] = useMutation(VERIFY_PAYMENT_MUTATION, {
    refetchQueries: [{ query: FETCH_BOOKINGS_QUERY }]
  });

  async function handleWishlist() {
    try {
      await toggleWishlist({
        variables: {
          serviceId: service.id
        }
      });
      setMessage('Wishlist updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Wishlist update failed.');
    }
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createBooking({
        variables: {
          input: {
            serviceId: service.id,
            eventDate: new Date(form.eventDate).toISOString(),
            guestCount: Number(form.guestCount),
            venue: form.venue,
            notes: form.notes || undefined
          }
        }
      });

      const booking = result.data?.createBooking;
      setLatestBookingId(booking?.id ?? null);
      setMessage(`Booking ${booking?.id ?? ''} created successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Booking failed.');
    }
  }

  async function handleInitiatePayment() {
    if (!latestBookingId) {
      setMessage('Create a booking before starting payment.');
      return;
    }

    try {
      const result = await initiatePayment({
        variables: {
          input: {
            bookingId: latestBookingId
          }
        }
      });

      setLatestOrderId(result.data?.initiatePayment?.razorpayOrderId ?? null);
      setMessage('Payment order created. Complete the test verification step to finish checkout.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment initiation failed.');
    }
  }

  async function handleVerifyPayment() {
    if (!latestBookingId || !latestOrderId) {
      setMessage('Initiate payment first.');
      return;
    }

    try {
      await verifyPayment({
        variables: {
          input: {
            bookingId: latestBookingId,
            razorpayOrderId: latestOrderId,
            razorpayPaymentId: makePaymentId(latestOrderId),
            razorpaySignature: 'development-placeholder'
          }
        }
      });

      setMessage('Payment verified successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment verification failed.');
    }
  }

  if (role !== 'USER') {
    return (
      <div className="rounded-[24px] bg-slate-950 p-5 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Book securely</p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          Sign in as a `USER` to create a booking, save this service to your wishlist, and test the Razorpay-ready payment flow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[24px] bg-slate-950 p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Booking workspace</p>
          <p className="mt-2 text-sm text-white/80">Starting price: Rs. {service.priceFrom.toLocaleString('en-IN')}</p>
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistState.loading}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
        >
          {wishlistState.loading ? 'Saving...' : 'Wishlist'}
        </button>
      </div>
      <form onSubmit={handleBooking} className="grid gap-3">
        <input
          required
          type="datetime-local"
          value={form.eventDate}
          onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <input
          required
          type="number"
          min={1}
          value={form.guestCount}
          onChange={(event) => setForm((current) => ({ ...current, guestCount: event.target.value }))}
          placeholder="Guest count"
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <input
          required
          value={form.venue}
          onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))}
          placeholder="Venue"
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Special request or planning notes"
          rows={3}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <button
          type="submit"
          disabled={createBookingState.loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
        >
          {createBookingState.loading ? 'Creating booking...' : 'Create booking'}
        </button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleInitiatePayment}
          disabled={initiateState.loading || !latestBookingId}
          className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white"
        >
          {initiateState.loading ? 'Preparing payment...' : 'Initiate payment'}
        </button>
        <button
          type="button"
          onClick={handleVerifyPayment}
          disabled={verifyState.loading || !latestOrderId}
          className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white"
        >
          {verifyState.loading ? 'Verifying...' : 'Verify payment'}
        </button>
      </div>
      <MessageBanner message={message} />
    </div>
  );
}

export function ProfileSettingsCard() {
  const { data } = useQuery(ME_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    phone: ''
  });
  const [updateProfile, updateState] = useMutation(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }]
  });

  useEffect(() => {
    if (data?.me) {
      setForm({
        fullName: data.me.fullName ?? '',
        username: data.me.username ?? '',
        phone: data.me.phone ?? ''
      });
    }
  }, [data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateProfile({
        variables: {
          input: {
            fullName: form.fullName,
            username: form.username || undefined,
            phone: form.phone || undefined
          }
        }
      });
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile update failed.');
    }
  }

  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight">Profile settings</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Email</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{data?.me?.email ?? 'No email'}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Role</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{data?.me?.role ?? 'USER'}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Account</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{data?.me?.isActive ? 'Active' : 'Disabled'}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
        <input
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          placeholder="Full name"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <input
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          placeholder="Username"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <input
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          placeholder="Phone"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={updateState.loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
        >
          {updateState.loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type BookingCardProps = {
  booking: {
    id: string;
    status: string;
    eventDate: string;
    guestCount: number;
    venue: string;
    notes?: string | null;
    totalAmount: number;
    service: {
      title: string;
    };
    payment?: {
      id: string;
      status: string;
      payoutStatus: string;
      razorpayOrderId?: string | null;
      razorpayPaymentId?: string | null;
    } | null;
    review?: {
      id: string;
      rating: number;
      comment?: string | null;
    } | null;
  };
};

export function UserBookingCard({ booking }: BookingCardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleVenue, setRescheduleVenue] = useState(booking.venue);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState<string | null>(booking.payment?.razorpayOrderId ?? null);

  const refetchQueries = [{ query: FETCH_BOOKINGS_QUERY }];

  const [cancelBooking, cancelState] = useMutation(CANCEL_BOOKING_MUTATION, { refetchQueries });
  const [rescheduleBooking, rescheduleState] = useMutation(RESCHEDULE_BOOKING_MUTATION, { refetchQueries });
  const [initiatePayment, initiateState] = useMutation(INITIATE_PAYMENT_MUTATION, { refetchQueries });
  const [verifyPayment, verifyState] = useMutation(VERIFY_PAYMENT_MUTATION, { refetchQueries });
  const [submitReview, reviewState] = useMutation(SUBMIT_REVIEW_MUTATION, { refetchQueries });

  async function handleCancel() {
    try {
      await cancelBooking({
        variables: {
          bookingId: booking.id,
          reason: 'Cancelled from user dashboard'
        }
      });
      setMessage('Booking cancelled.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cancellation failed.');
    }
  }

  async function handleReschedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await rescheduleBooking({
        variables: {
          input: {
            bookingId: booking.id,
            eventDate: new Date(rescheduleDate).toISOString(),
            venue: rescheduleVenue
          }
        }
      });
      setMessage('Booking rescheduled.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reschedule failed.');
    }
  }

  async function handleInitiatePayment() {
    try {
      const result = await initiatePayment({
        variables: {
          input: {
            bookingId: booking.id
          }
        }
      });
      setOrderId(result.data?.initiatePayment?.razorpayOrderId ?? null);
      setMessage('Payment order created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment initiation failed.');
    }
  }

  async function handleVerifyPayment() {
    if (!orderId) {
      setMessage('Initiate payment first.');
      return;
    }

    try {
      await verifyPayment({
        variables: {
          input: {
            bookingId: booking.id,
            razorpayOrderId: orderId,
            razorpayPaymentId: makePaymentId(orderId),
            razorpaySignature: 'development-placeholder'
          }
        }
      });
      setMessage('Payment verified.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment verification failed.');
    }
  }

  async function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await submitReview({
        variables: {
          input: {
            bookingId: booking.id,
            rating: Number(rating),
            comment: comment || undefined
          }
        }
      });
      setMessage('Review submitted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review submission failed.');
    }
  }

  const canCancel = ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status);
  const canReview = ['CONFIRMED', 'COMPLETED'].includes(booking.status) && !booking.review;
  const needsPayment = booking.payment?.status !== 'PAID';

  return (
    <div className="rounded-[24px] border border-rose-100 bg-rose-50/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{booking.service.title}</p>
          <p className="mt-1 text-sm text-slate-600">{booking.venue}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          {booking.status}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        {new Date(booking.eventDate).toLocaleDateString()} - Rs. {booking.totalAmount.toLocaleString('en-IN')}
      </p>
      <div className="mt-4 grid gap-3">
        {needsPayment ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Payment status: {booking.payment?.status ?? 'PENDING'}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={initiateState.loading}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                {initiateState.loading ? 'Preparing...' : 'Initiate payment'}
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={verifyState.loading}
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
              >
                {verifyState.loading ? 'Verifying...' : 'Verify payment'}
              </button>
            </div>
          </div>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelState.loading}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
          >
            {cancelState.loading ? 'Cancelling...' : 'Cancel booking'}
          </button>
        ) : null}
        {canCancel ? (
          <form onSubmit={handleReschedule} className="rounded-2xl border border-rose-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Reschedule booking</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                required
                type="datetime-local"
                value={rescheduleDate}
                onChange={(event) => setRescheduleDate(event.target.value)}
                className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
              <input
                value={rescheduleVenue}
                onChange={(event) => setRescheduleVenue(event.target.value)}
                placeholder="Venue"
                className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={rescheduleState.loading || !rescheduleDate}
              className="mt-3 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {rescheduleState.loading ? 'Saving...' : 'Save new schedule'}
            </button>
          </form>
        ) : null}
        {booking.review ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Review submitted</p>
            <p className="mt-2 text-sm text-slate-600">
              {booking.review.rating} / 5 {booking.review.comment ? `- ${booking.review.comment}` : ''}
            </p>
          </div>
        ) : null}
        {canReview ? (
          <form onSubmit={handleReview} className="rounded-2xl border border-rose-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Submit review</p>
            <div className="mt-3 grid gap-3">
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your experience"
                className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
              />
              <button
                type="submit"
                disabled={reviewState.loading}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {reviewState.loading ? 'Submitting...' : 'Submit review'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type PartnerServiceCardProps = {
  service: {
    id: string;
    title: string;
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
    category: {
      name: string;
      slug: string;
    };
  };
};

export function PartnerServiceCard({ service }: PartnerServiceCardProps) {
  const { data: categoriesData } = useQuery(SERVICE_CATEGORIES_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: service.title,
    summary: service.summary,
    description: service.description,
    categorySlug: service.category.slug,
    status: service.status,
    priceFrom: String(service.priceFrom),
    city: service.city,
    state: service.state ?? '',
    durationHours: service.durationHours ? String(service.durationHours) : '',
    guestCapacity: service.guestCapacity ? String(service.guestCapacity) : '',
    coverImageUrl: service.coverImageUrl ?? '',
    galleryUrls: (service.galleryUrls ?? []).join(', ')
  });

  const refetchQueries = [{ query: MY_VENDOR_SERVICES_QUERY }];
  const [updateService, updateState] = useMutation(UPDATE_SERVICE_MUTATION, { refetchQueries });
  const [deleteService, deleteState] = useMutation(DELETE_SERVICE_MUTATION, { refetchQueries });

  async function handleUpdate() {
    try {
      await updateService({
        variables: {
          input: {
            serviceId: service.id,
            title: form.title,
            summary: form.summary,
            description: form.description,
            categorySlug: form.categorySlug,
            status: form.status,
            priceFrom: Number(form.priceFrom),
            city: form.city,
            state: form.state || undefined,
            durationHours: form.durationHours ? Number(form.durationHours) : undefined,
            guestCapacity: form.guestCapacity ? Number(form.guestCapacity) : undefined,
            coverImageUrl: form.coverImageUrl || undefined,
            galleryUrls: form.galleryUrls ? form.galleryUrls.split(',').map(s => s.trim()).filter(Boolean) : []
          }
        }
      });
      setMessage('Service updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Service update failed.');
    }
  }

  async function handleArchive() {
    try {
      await deleteService({
        variables: {
          serviceId: service.id
        }
      });
      setMessage('Service archived.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Archiving failed.');
    }
  }

  return (
    <div className="rounded-[24px] border border-rose-100 bg-rose-50/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{service.title}</p>
          <p className="mt-1 text-sm text-slate-600">{service.category.name} - {service.city}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
            {service.status}
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${
            service.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
            service.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 
            'bg-amber-100 text-amber-700'
          }`}>
            Admin: {service.approvalStatus}
          </span>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <ServiceImagePreview title={form.title} imageUrl={form.coverImageUrl} />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Service title"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
          />
          <textarea
            rows={2}
            value={form.summary}
            onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            placeholder="Summary"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <textarea
            rows={2}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <select
            value={form.categorySlug}
            onChange={(event) => setForm((current) => ({ ...current, categorySlug: event.target.value }))}
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          >
            {(categoriesData?.serviceCategories ?? []).map((category: { id: string; slug: string; name: string }) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          >
            {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            value={form.priceFrom}
            onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))}
            type="number"
            min={1}
            placeholder="Price"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="City"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.state}
            onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            placeholder="State"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.durationHours}
            onChange={(event) => setForm((current) => ({ ...current, durationHours: event.target.value }))}
            type="number"
            min={1}
            placeholder="Duration hours"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.guestCapacity}
            onChange={(event) => setForm((current) => ({ ...current, guestCapacity: event.target.value }))}
            type="number"
            min={1}
            placeholder="Guest capacity"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.coverImageUrl}
            onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))}
            placeholder="Cover image URL"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
          />
          <textarea
            rows={2}
            value={form.galleryUrls}
            onChange={(event) => setForm((current) => ({ ...current, galleryUrls: event.target.value }))}
            placeholder="Gallery image URLs (comma separated)"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={updateState.loading}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          {updateState.loading ? 'Saving...' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={handleArchive}
          disabled={deleteState.loading}
          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
        >
          {deleteState.loading ? 'Archiving...' : 'Archive'}
        </button>
      </div>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function PartnerServiceStudio() {
  const { data: categoriesData } = useQuery(SERVICE_CATEGORIES_QUERY);
  const { data: servicesData } = useQuery(MY_VENDOR_SERVICES_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [form, setForm] = useState({
    partnerName: '',
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
    galleryUrls: '',
    phone: '',
    email: '',
    tags: '',
    products: '',
    openingHour: '',
    closingHour: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    if (!form.categorySlug && categoriesData?.serviceCategories?.[0]?.slug) {
      setForm((current) => ({ ...current, categorySlug: categoriesData.serviceCategories[0].slug }));
    }
  }, [categoriesData, form.categorySlug]);

  const [createService, createState] = useMutation(CREATE_SERVICE_MUTATION, {
    refetchQueries: [{ query: MY_VENDOR_SERVICES_QUERY }]
  });

  function handleSubmitAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsTermsOpen(true);
  }

  async function handleCreate() {
    setIsTermsOpen(false);
    try {
      await createService({
        variables: {
          input: {
            title: form.title,
            summary: `${form.summary} | Products: ${form.products || 'None'} | Tags: ${form.tags || 'None'} | Hours: ${form.openingHour || 'N/A'} - ${form.closingHour || 'N/A'}`,
            description: form.description,
            categorySlug: form.categorySlug,
            priceFrom: Number(form.priceFrom),
            city: form.city,
            state: form.state || undefined,
            durationHours: form.durationHours ? Number(form.durationHours) : undefined,
            guestCapacity: form.guestCapacity ? Number(form.guestCapacity) : undefined,
            coverImageUrl: form.coverImageUrl || undefined,
            galleryUrls: form.galleryUrls ? form.galleryUrls.split(',').map(s => s.trim()).filter(Boolean) : [],
            status: form.status,
            approvalStatus: 'PENDING'
          }
        }
      });

      setForm({
        partnerName: '',
        title: '',
        summary: '',
        description: '',
        categorySlug: categoriesData?.serviceCategories?.[0]?.slug ?? '',
        priceFrom: '',
        city: '',
        state: '',
        durationHours: '',
        guestCapacity: '',
        coverImageUrl: '',
        galleryUrls: '',
        phone: '',
        email: '',
        tags: '',
        products: '',
        openingHour: '',
        closingHour: '',
        status: 'DRAFT'
      });
      setMessage('Professional service profile created successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Service creation failed.');
    }
  }

  const termsContent = `
Happy Lokam Partner Service Guidelines (2026):

1. Accuracy: You must provide genuine information about your services and pricing.
2. Legality: All services must comply with national regulations and MCA guidelines.
3. Quality: Partners are expected to maintain professional standards for every booking.
4. Transparency: Any additional charges must be disclosed upfront to the user.
5. Protection: Happy Lokam protects both users and partners through verified protocols.

By clicking 'Accept & Continue', you agree to these legal terms as updated by the Administrator.
  `;

  return (
    <div className="space-y-12">
      <TermsModal 
        isOpen={isTermsOpen} 
        onAccept={handleCreate} 
        onClose={() => setIsTermsOpen(false)} 
        title="Partner Service Agreement"
        content={termsContent}
      />

      <div className="panel overflow-hidden border-rose-100 ring-1 ring-rose-50/50">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-rose-50 pb-8">
          <div>
            <span className="pill">Service Studio</span>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Draft your <span className="text-rose-600">Masterpiece.</span></h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Create a modern listing that attracts high-value bookings. Be specific about your products, pricing, and operational capacity.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 shadow-inner">
            <PackageCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <ServiceImagePreview title={form.title || 'Service Preview'} imageUrl={form.coverImageUrl} />
            <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6">
                 <h4 className="font-display text-lg font-bold text-slate-900">Partner Details (Optional)</h4>
                 <div className="mt-4 space-y-3">
                    <input
                      value={form.partnerName}
                      onChange={(event) => setForm((current) => ({ ...current, partnerName: event.target.value }))}
                      placeholder="Individual or representative name"
                      className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm"
                    />
                    <div className="grid gap-3 grid-cols-2">
                        <input
                            value={form.phone}
                            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                            placeholder="Phone (Optional)"
                            className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm"
                        />
                        <input
                            value={form.email}
                            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                            placeholder="Email (Optional)"
                            className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm"
                        />
                    </div>
                 </div>
            </div>
          </div>

          <form onSubmit={handleSubmitAttempt} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Core Information</p>
                <input
                    required
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Service Title Name (e.g. Premium Wedding Photography)"
                    className="w-full rounded-2xl border border-rose-100 px-4 py-3.5 text-sm font-semibold text-slate-900"
                />
            </div>

            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Detailed Description of your excellent services"
              className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
            />

            <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Categorization</p>
                <select
                    value={form.categorySlug}
                    onChange={(event) => setForm((current) => ({ ...current, categorySlug: event.target.value }))}
                    className="w-full rounded-2xl border border-rose-100 px-4 py-3 text-sm bg-white"
                >
                    {(categoriesData?.serviceCategories ?? []).map((category: { id: string; slug: string; name: string }) => (
                    <option key={category.id} value={category.slug}>
                        {category.name}
                    </option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Pricing & Status</p>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        required
                        type="number"
                        min={1}
                        value={form.priceFrom}
                        onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))}
                        placeholder="Charge Amount (Rs)"
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm font-bold text-rose-600"
                    />
                    <select
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm bg-white"
                    >
                        {['DRAFT', 'PUBLISHED'].map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="md:col-span-2 space-y-4 pt-4 border-t border-rose-50">
               <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Service Logistics</p>
               <div className="grid gap-3 md:grid-cols-2">
                    <input
                        type="number"
                        min={1}
                        value={form.durationHours}
                        onChange={(event) => setForm((current) => ({ ...current, durationHours: event.target.value }))}
                        placeholder="Service Duration (Hours)"
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                    />
                    <input
                        type="number"
                        min={1}
                        value={form.guestCapacity}
                        onChange={(event) => setForm((current) => ({ ...current, guestCapacity: event.target.value }))}
                        placeholder="Maximum Guest Capacity"
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                    />
               </div>
            </div>

            <div className="md:col-span-2 space-y-4 pt-4 border-t border-rose-50">
               <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Operation Hours</p>
               <div className="grid gap-3 md:grid-cols-2">
                    <input
                        type="time"
                        value={form.openingHour}
                        onChange={(event) => setForm((current) => ({ ...current, openingHour: event.target.value }))}
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                        placeholder="Opening Hour"
                    />
                    <input
                        type="time"
                        value={form.closingHour}
                        onChange={(event) => setForm((current) => ({ ...current, closingHour: event.target.value }))}
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                        placeholder="Closing Hour"
                    />
               </div>
            </div>

            <div className="md:col-span-2 space-y-4 pt-4 border-t border-rose-50">
               <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500">Experience Highlights</p>
               <div className="grid gap-3 md:grid-cols-2">
                    <input
                        value={form.products}
                        onChange={(event) => setForm((current) => ({ ...current, products: event.target.value }))}
                        placeholder="Key Products included (e.g. Album, Raw Footage)"
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                    />
                    <input
                        value={form.tags}
                        onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                        placeholder="Search Tags (e.g. Wedding, Outdoor)"
                        className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                    />
               </div>
            </div>

            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                <input
                    required
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="Operation City"
                    className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                />
                <input
                    value={form.state}
                    onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                    placeholder="State"
                    className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
                />
            </div>

            <input
                value={form.coverImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))}
                placeholder="Cover Image URL (Polished Photography)"
                className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
            />

            <button
              type="submit"
              disabled={createState.loading}
              className="mt-6 rounded-[24px] bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-2xl transition hover:bg-rose-600 md:col-span-2"
            >
              {createState.loading ? <PremiumLoader className="border-white" /> : 'Review Guidelines & Publish Service'}
            </button>
          </form>
        </div>
        <div className="mt-8">
          <MessageBanner message={message} />
        </div>
      </div>
      <div className="space-y-4">
        {(servicesData?.myVendorServices ?? []).map(
          (service: PartnerServiceCardProps['service']) => (
            <PartnerServiceCard key={service.id} service={service} />
          )
        )}
      </div>
    </div>
  );
}

type PartnerBookingManagerProps = {
  bookings: Array<{
    id: string;
    status: string;
    venue: string;
    totalAmount: number;
    service: {
      title: string;
    };
  }>;
};

export function PartnerBookingManager({ bookings }: PartnerBookingManagerProps) {
  return bookings.length ? (
    <div className="space-y-4">{bookings.map((booking) => <PartnerBookingCard key={booking.id} booking={booking} />)}</div>
  ) : (
    <p className="text-sm text-slate-500">Order requests will appear here once users begin booking your services.</p>
  );
}

function PartnerBookingCard({ booking }: { booking: PartnerBookingManagerProps['bookings'][number] }) {
  const [status, setStatus] = useState(booking.status);
  const [message, setMessage] = useState<string | null>(null);
  const [updateBookingStatus, updateState] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, {
    refetchQueries: [{ query: FETCH_BOOKINGS_QUERY }]
  });

  async function handleSave() {
    try {
      await updateBookingStatus({
        variables: {
          input: {
            bookingId: booking.id,
            status,
            notes: `Updated from partner dashboard to ${status}`
          }
        }
      });
      setMessage('Status synced successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Status sync failed.');
    }
  }

  return (
    <div className="rounded-[32px] border border-rose-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
           <p className="font-display text-lg font-bold text-slate-950">{booking.service.title}</p>
           <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
             <Store className="h-4 w-4 text-rose-500" />
             {booking.venue}
           </p>
        </div>
        <div className="text-right">
           <p className="font-display text-lg font-bold text-rose-600">Rs. {booking.totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-rose-50 pt-6">
        <select 
            value={status} 
            onChange={(event) => setStatus(event.target.value)} 
            className="rounded-2xl border border-rose-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-rose-300 focus:ring-rose-200"
        >
          {['PENDING', 'CONFIRMED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateState.loading}
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
        >
          {updateState.loading ? 'Syncing...' : 'Update Status'}
        </button>
      </div>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type PartnerAvailabilityManagerProps = {
  availability: Array<{
    id: string;
    startAt: string;
    endAt: string;
    label?: string | null;
  }>;
};

export function PartnerAvailabilityManager({ availability }: PartnerAvailabilityManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [lines, setLines] = useState('');
  const [upsertAvailability, upsertState] = useMutation(UPSERT_VENDOR_AVAILABILITY_MUTATION, {
    refetchQueries: [{ query: MY_VENDOR_PROFILE_QUERY }]
  });

  useEffect(() => {
    if (!lines && availability.length) {
      setLines(
        availability
          .map((slot) => `${new Date(slot.startAt).toISOString()} | ${new Date(slot.endAt).toISOString()} | ${slot.label ?? 'Open slot'}`)
          .join('\n')
      );
    }
  }, [availability, lines]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const slots = lines
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [startAt, endAt, label] = line.split('|').map((part) => part.trim());

          if (!startAt || !endAt) {
            throw new Error('Each line must be: startAt | endAt | label');
          }

          return {
            startAt,
            endAt,
            label: label || undefined
          };
        });

      await upsertAvailability({
        variables: {
          input: {
            slots
          }
        }
      });
      setMessage('Availability updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Availability update failed.');
    }
  }

  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight text-slate-950">Availability Registry</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Manage your active schedule for bookings. Enter slots using the professional format: `ISO_START | ISO_END | Service Label`.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
        <textarea
          rows={6}
          value={lines}
          onChange={(event) => setLines(event.target.value)}
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={upsertState.loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
        >
          {upsertState.loading ? 'Updating...' : 'Replace availability'}
        </button>
      </form>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type PartnerProfileManagerProps = {
  profile: {
    businessName?: string;
    description?: string | null;
    city?: string;
    state?: string | null;
    approvalStatus?: string;
  };
};

export function PartnerProfileManager({ profile }: PartnerProfileManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: profile.businessName ?? '',
    description: profile.description ?? '',
    city: profile.city ?? '',
    state: profile.state ?? ''
  });
  const [updateVendorProfile, updateState] = useMutation(UPDATE_VENDOR_PROFILE_MUTATION, {
    refetchQueries: [{ query: MY_VENDOR_PROFILE_QUERY }]
  });

  useEffect(() => {
    setForm({
      businessName: profile.businessName ?? '',
      description: profile.description ?? '',
      city: profile.city ?? '',
      state: profile.state ?? ''
    });
  }, [profile.businessName, profile.description, profile.city, profile.state]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateVendorProfile({
        variables: {
          input: {
            businessName: form.businessName,
            description: form.description || undefined,
            city: form.city,
            state: form.state || undefined
          }
        }
      });
      setMessage('Vendor profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Vendor profile update failed.');
    }
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950">Commercial Identity</h2>
          <p className="mt-2 text-sm font-semibold text-rose-600 uppercase tracking-widest">Verification: {profile.approvalStatus ?? 'Verifying'}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
        <input
          value={form.businessName}
          onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
          placeholder="Business name"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <input
          value={form.city}
          onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          placeholder="City"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
        />
        <input
          value={form.state}
          onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
          placeholder="State"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
        />
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Business description"
          className="rounded-2xl border border-rose-100 px-4 py-3 text-sm md:col-span-2"
        />
        <button
          type="submit"
          disabled={updateState.loading}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white md:col-span-2"
        >
          {updateState.loading ? 'Saving...' : 'Save vendor profile'}
        </button>
      </form>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type PartnerPayoutManagerProps = {
  bookings: Array<{
    id: string;
    totalAmount: number;
    service: {
      title: string;
    };
    payment?: {
      id: string;
      status: string;
      payoutStatus: string;
    } | null;
  }>;
};

export function PartnerPayoutManager({ bookings }: PartnerPayoutManagerProps) {
  const eligible = bookings.filter(
    (booking) => booking.payment?.status === 'PAID'
  );

  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight text-slate-950">Treasury & Settlements</h2>
      <div className="mt-6 space-y-3">
        {eligible.length ? (
          eligible.map((booking) => <PartnerPayoutCard key={booking.id} booking={booking} />)
        ) : (
          <p className="text-sm text-slate-500">Completed settlements will appear here when payouts become eligible.</p>
        )}
      </div>
    </div>
  );
}

function PartnerPayoutCard({ booking }: { booking: PartnerPayoutManagerProps['bookings'][number] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [requestVendorPayout, requestState] = useMutation(REQUEST_VENDOR_PAYOUT_MUTATION, {
    refetchQueries: [{ query: FETCH_BOOKINGS_QUERY }]
  });

  async function handleRequest() {
    if (!booking.payment?.id) {
      setMessage('No payment record found for this booking.');
      return;
    }

    try {
      await requestVendorPayout({
        variables: {
          paymentId: booking.payment.id
        }
      });
      setMessage('Payout requested.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payout request failed.');
    }
  }

  return (
    <div className="rounded-[20px] border border-rose-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{booking.service.title}</p>
          <p className="text-sm text-slate-500">Rs. {booking.totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
            {booking.payment?.payoutStatus ?? 'NOT_REQUESTED'}
          </span>
          {booking.payment?.payoutStatus === 'NOT_REQUESTED' ? (
            <button
              type="button"
              onClick={handleRequest}
              disabled={requestState.loading}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              {requestState.loading ? 'Requesting...' : 'Request payout'}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function AdminUsersManager() {
  const { data } = useQuery(ADMIN_USERS_QUERY);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [setUserActiveStatus, activeState] = useMutation(SET_USER_ACTIVE_STATUS_MUTATION, {
    refetchQueries: [{ query: ADMIN_USERS_QUERY }]
  });
  
  const users = data?.adminUsers ?? [];
  const selectedCount = selectedIds.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedCount === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u: any) => u.id));
    }
  };

  async function handleBulkStatus(isActive: boolean) {
    if (!selectedIds.length) {
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((userId) =>
          setUserActiveStatus({
            variables: {
              input: {
                userId,
                isActive
              }
            }
          })
        )
      );
      setMessage(`${selectedIds.length} users ${isActive ? 'activated' : 'updated to suspended'} successfully.`);
      setSelectedIds([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bulk user update failed.');
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-tight">Manage users</h2>
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-2 text-white animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold uppercase tracking-widest">{selectedCount} selected</span>
            <div className="h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => handleBulkStatus(false)}
              disabled={activeState.loading}
              className="text-xs font-bold uppercase tracking-widest hover:text-rose-400 disabled:opacity-50"
            >
              Suspend
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus(true)}
              disabled={activeState.loading}
              className="text-xs font-bold uppercase tracking-widest hover:text-emerald-400 disabled:opacity-50"
            >
              Activate
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100">
           <input 
            type="checkbox" 
            checked={selectedCount > 0 && selectedCount === users.length}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Select all users</span>
        </div>
        <div className="mt-3 space-y-3">
          {users.map((user: { id: string; fullName: string; email?: string | null; role: string; isActive: boolean }) => (
            <div key={user.id} className="flex items-center gap-4">
               <input 
                type="checkbox" 
                checked={selectedIds.includes(user.id)}
                onChange={() => toggleSelect(user.id)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1">
                <AdminUserRoleCard user={user} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

function AdminUserRoleCard({ user }: { user: { id: string; fullName: string; email?: string | null; role: string; isActive: boolean } }) {
  const [role, setRole] = useState(user.role);
  const [message, setMessage] = useState<string | null>(null);
  const [updateUserRole, updateState] = useMutation(UPDATE_USER_ROLE_MUTATION, {
    refetchQueries: [{ query: ADMIN_USERS_QUERY }]
  });
  const [setUserActiveStatus, activeState] = useMutation(SET_USER_ACTIVE_STATUS_MUTATION, {
    refetchQueries: [{ query: ADMIN_USERS_QUERY }]
  });

  async function handleSave() {
    try {
      await updateUserRole({
        variables: {
          input: {
            userId: user.id,
            role
          }
        }
      });
      setMessage('Role updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Role update failed.');
    }
  }

  async function handleStatus(isActive: boolean) {
    try {
      await setUserActiveStatus({
        variables: {
          input: {
            userId: user.id,
            isActive
          }
        }
      });
      setMessage(isActive ? 'User activated.' : 'User suspended.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'User status update failed.');
    }
  }

  return (
    <div className="rounded-[20px] border border-rose-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{user.fullName}</p>
          <p className="text-sm text-slate-500">{user.email ?? 'No email attached'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {user.isActive ? 'Active' : 'Suspended'}
          </span>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-rose-100 px-4 py-3 text-sm">
            {['USER', 'VENDOR', 'ADMIN'].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateState.loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            {updateState.loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => handleStatus(!user.isActive)}
            disabled={activeState.loading}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
          >
            {activeState.loading ? 'Updating...' : user.isActive ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function AdminVendorsManager() {
  const { data } = useQuery(ADMIN_VENDORS_QUERY);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [approveVendor, approveState] = useMutation(APPROVE_VENDOR_MUTATION, {
    refetchQueries: [{ query: ADMIN_VENDORS_QUERY }, { query: ADMIN_ANALYTICS_QUERY }]
  });
  
  const vendors = data?.adminVendors ?? [];
  const selectedCount = selectedIds.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedCount === vendors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(vendors.map((v: any) => v.id));
    }
  };

  async function handleBulkStatus(status: string) {
    try {
      await Promise.all(
        selectedIds.map((vendorId) =>
          approveVendor({
            variables: {
              input: {
                vendorId,
                status
              }
            }
          })
        )
      );

      setMessage(`${selectedIds.length} vendors updated to ${status}.`);
      setSelectedIds([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bulk vendor update failed.');
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-tight">Approve vendors</h2>
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-2 text-white animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold uppercase tracking-widest">{selectedCount} selected</span>
            <div className="h-4 w-px bg-white/20" />
            <button type="button" onClick={() => handleBulkStatus('REJECTED')} disabled={approveState.loading} className="text-xs font-bold uppercase tracking-widest hover:text-rose-400 disabled:opacity-50">Reject</button>
            <button type="button" onClick={() => handleBulkStatus('APPROVED')} disabled={approveState.loading} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-400 disabled:opacity-50">Approve</button>
            <button type="button" onClick={() => handleBulkStatus('SUSPENDED')} disabled={approveState.loading} className="text-xs font-bold uppercase tracking-widest hover:text-sky-400 disabled:opacity-50">Suspend</button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100">
           <input 
            type="checkbox" 
            checked={selectedCount > 0 && selectedCount === vendors.length}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Select all vendors</span>
        </div>
        <div className="mt-3 space-y-3">
          {vendors.map((vendor: { id: string; businessName: string; approvalStatus: string; owner: { email?: string | null } }) => (
            <div key={vendor.id} className="flex items-center gap-4">
               <input 
                type="checkbox" 
                checked={selectedIds.includes(vendor.id)}
                onChange={() => toggleSelect(vendor.id)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1">
                <AdminVendorApprovalCard vendor={vendor} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <MessageBanner message={message} />
    </div>
  );
}

function AdminVendorApprovalCard({
  vendor
}: {
  vendor: { id: string; businessName: string; approvalStatus: string; owner: { email?: string | null } };
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [approveVendor, approveState] = useMutation(APPROVE_VENDOR_MUTATION, {
    refetchQueries: [{ query: ADMIN_VENDORS_QUERY }, { query: ADMIN_ANALYTICS_QUERY }]
  });

  async function handleStatus(status: string) {
    try {
      await approveVendor({
        variables: {
          input: {
            vendorId: vendor.id,
            status
          }
        }
      });
      setMessage(`Vendor marked ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Vendor approval update failed.');
    }
  }

  return (
    <div className="rounded-[20px] border border-rose-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{vendor.businessName}</p>
          <p className="text-sm text-slate-500">{vendor.owner.email ?? 'No owner email'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['APPROVED', 'REJECTED', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatus(status)}
              disabled={approveState.loading}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                vendor.approvalStatus === status ? 'bg-rose-600 text-white' : 'border border-rose-200 text-rose-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

type AdminBookingsManagerProps = {
  bookings: Array<{
    id: string;
    status: string;
    venue: string;
    totalAmount: number;
    notes?: string | null;
    user: {
      fullName: string;
    };
    vendor: {
      businessName: string;
    };
    service: {
      title: string;
    };
  }>;
};

export function AdminBookingsManager({ bookings }: AdminBookingsManagerProps) {
  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight">Manage bookings</h2>
      <div className="mt-6 space-y-3">
        {bookings.length ? (
          bookings.map((booking) => <AdminBookingCard key={booking.id} booking={booking} />)
        ) : (
          <p className="text-sm text-slate-500">No bookings available yet.</p>
        )}
      </div>
    </div>
  );
}

function AdminBookingCard({ booking }: { booking: AdminBookingsManagerProps['bookings'][number] }) {
  const [status, setStatus] = useState(booking.status);
  const [message, setMessage] = useState<string | null>(null);
  const [updateBookingStatus, updateState] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, {
    refetchQueries: [{ query: ADMIN_BOOKINGS_QUERY }, { query: FETCH_BOOKINGS_QUERY }]
  });

  async function handleSave() {
    try {
      await updateBookingStatus({
        variables: {
          input: {
            bookingId: booking.id,
            status,
            notes: booking.notes ?? `Updated by admin to ${status}`
          }
        }
      });
      setMessage('Booking updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Booking update failed.');
    }
  }

  return (
    <div className="rounded-[20px] border border-rose-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{booking.service.title}</p>
          <p className="text-sm text-slate-500">
            {booking.user.fullName} - {booking.vendor.businessName}
          </p>
          <p className="text-sm text-slate-500">
            {booking.venue} - Rs. {booking.totalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-rose-100 px-4 py-3 text-sm">
            {['PENDING', 'CONFIRMED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateState.loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            {updateState.loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function AdminPaymentsManager() {
  const { data } = useQuery(ADMIN_PAYMENTS_QUERY);

  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight">Payments and payouts</h2>
      <div className="mt-6 space-y-3">
        {(data?.adminPayments ?? []).map((payment: { id: string; amount: number; status: string; payoutStatus: string }) => (
          <AdminPaymentCard key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}

function AdminPaymentCard({ payment }: { payment: { id: string; amount: number; status: string; payoutStatus: string } }) {
  const [message, setMessage] = useState<string | null>(null);
  const [markPayoutPaid, markState] = useMutation(MARK_PAYOUT_PAID_MUTATION, {
    refetchQueries: [{ query: ADMIN_PAYMENTS_QUERY }]
  });

  async function handlePayout() {
    try {
      await markPayoutPaid({
        variables: {
          input: {
            paymentId: payment.id
          }
        }
      });
      setMessage('Payout marked as paid.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payout update failed.');
    }
  }

  return (
    <div className="rounded-[20px] border border-rose-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Rs. {payment.amount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500">
            Payment {payment.status} - Payout {payment.payoutStatus}
          </p>
        </div>
        {payment.payoutStatus === 'PENDING' ? (
          <button
            type="button"
            onClick={handlePayout}
            disabled={markState.loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            {markState.loading ? 'Saving...' : 'Mark payout paid'}
          </button>
        ) : null}
      </div>
      <div className="mt-3">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function AdminCmsManager() {
  const { data } = useQuery(ADMIN_CMS_QUERY);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    pageId: '',
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    isPublished: true
  });
  const [upsertCmsPage, upsertState] = useMutation(UPSERT_CMS_PAGE_MUTATION, {
    refetchQueries: [{ query: ADMIN_CMS_QUERY }]
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await upsertCmsPage({
        variables: {
          input: {
            pageId: form.pageId || undefined,
            slug: form.slug,
            title: form.title,
            excerpt: form.excerpt || undefined,
            body: form.body,
            isPublished: form.isPublished
          }
        }
      });
      setMessage('CMS page saved.');
      setForm({
        pageId: '',
        slug: '',
        title: '',
        excerpt: '',
        body: '',
        isPublished: true
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'CMS update failed.');
    }
  }

  return (
    <div className="panel">
      <h2 className="font-display text-3xl tracking-tight">CMS manager</h2>
      <div className="mt-6 grid gap-3">
        <div className="flex flex-wrap gap-2">
          {(data?.adminCmsPages ?? []).map((page: any) => (
            <button
              key={page.id}
              type="button"
              onClick={() =>
                setForm({
                  pageId: page.id,
                  slug: page.slug,
                  title: page.title,
                  excerpt: page.excerpt ?? '',
                  body: page.body,
                  isPublished: page.isPublished
                })
              }
              className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
            >
              {page.title}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Title"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
            placeholder="Excerpt"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <textarea
            rows={5}
            value={form.body}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            placeholder="Body"
            className="rounded-2xl border border-rose-100 px-4 py-3 text-sm"
          />
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
            />
            Published
          </label>
          <button
            type="submit"
            disabled={upsertState.loading}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
          >
            {upsertState.loading ? 'Saving...' : 'Save CMS page'}
          </button>
        </form>
      </div>
      <div className="mt-4">
        <MessageBanner message={message} />
      </div>
    </div>
  );
}

export function AdminActivityStream() {
  const { data: bookingsData } = useQuery(ADMIN_BOOKINGS_QUERY);
  const { data: paymentsData } = useQuery(ADMIN_PAYMENTS_QUERY);
  const { data: vendorsData } = useQuery(ADMIN_VENDORS_QUERY);

  const activities = [
    ...((bookingsData?.adminBookings ?? []).map((booking: any) => ({
      id: `booking-${booking.id}`,
      title: `${booking.status} booking for ${booking.service.title}`,
      actor: booking.user?.fullName ?? 'User',
      time: booking.updatedAt ?? booking.createdAt,
      icon: 'booking'
    })) as Array<{ id: string; title: string; actor: string; time: string; icon: string }>),
    ...((paymentsData?.adminPayments ?? []).map((payment: any) => ({
      id: `payment-${payment.id}`,
      title: `${payment.status} payment of Rs. ${Number(payment.amount ?? 0).toLocaleString('en-IN')}`,
      actor: payment.provider ?? 'Payment gateway',
      time: payment.paidAt ?? payment.updatedAt ?? payment.createdAt,
      icon: 'payment'
    })) as Array<{ id: string; title: string; actor: string; time: string; icon: string }>),
    ...((vendorsData?.adminVendors ?? []).map((vendor: any) => ({
      id: `vendor-${vendor.id}`,
      title: `${vendor.businessName} moved to ${vendor.approvalStatus}`,
      actor: vendor.owner?.fullName ?? 'Partner owner',
      time: vendor.updatedAt ?? vendor.createdAt,
      icon: 'vendor'
    })) as Array<{ id: string; title: string; actor: string; time: string; icon: string }>)
  ]
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-4 rounded-2xl border border-rose-100 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{act.title}</p>
            <p className="text-xs text-slate-500">by {act.actor} • {new Date(act.time).toLocaleString('en-IN')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminAuditLogManager() {
  const { data: usersData } = useQuery(ADMIN_USERS_QUERY);
  const { data: vendorsData } = useQuery(ADMIN_VENDORS_QUERY);
  const { data: bookingsData } = useQuery(ADMIN_BOOKINGS_QUERY);
  const { data: paymentsData } = useQuery(ADMIN_PAYMENTS_QUERY);

  const logs = [
    ...((usersData?.adminUsers ?? []).map((user: any) => ({
      id: `user-${user.id}`,
      action: user.isActive ? 'USER_ACTIVE' : 'USER_SUSPENDED',
      target: user.fullName,
      admin: user.role,
      time: user.updatedAt ?? user.createdAt
    })) as Array<{ id: string; action: string; target: string; admin: string; time: string }>),
    ...((vendorsData?.adminVendors ?? []).map((vendor: any) => ({
      id: `vendor-${vendor.id}`,
      action: `VENDOR_${vendor.approvalStatus}`,
      target: vendor.businessName,
      admin: vendor.owner?.fullName ?? 'Admin',
      time: vendor.updatedAt ?? vendor.createdAt
    })) as Array<{ id: string; action: string; target: string; admin: string; time: string }>),
    ...((bookingsData?.adminBookings ?? []).map((booking: any) => ({
      id: `booking-${booking.id}`,
      action: `BOOKING_${booking.status}`,
      target: booking.service.title,
      admin: booking.user?.fullName ?? 'User',
      time: booking.updatedAt ?? booking.createdAt
    })) as Array<{ id: string; action: string; target: string; admin: string; time: string }>),
    ...((paymentsData?.adminPayments ?? []).map((payment: any) => ({
      id: `payment-${payment.id}`,
      action: `PAYMENT_${payment.status}`,
      target: `Rs. ${payment.amount.toLocaleString('en-IN')}`,
      admin: payment.provider,
      time: payment.updatedAt ?? payment.createdAt
    })) as Array<{ id: string; action: string; target: string; admin: string; time: string }>)
  ]
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 12);

  if (!usersData || !vendorsData || !bookingsData || !paymentsData) {
    return (
      <div className="panel overflow-hidden">
        <h2 className="font-display text-3xl tracking-tight">Audit log</h2>
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <h2 className="font-display text-3xl tracking-tight">Audit log</h2>
      <div className="mt-6 flex flex-col gap-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-950">{log.action}</p>
              <p className="text-xs text-slate-500">Target: {log.target} • Context: {log.admin}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{new Date(log.time).toLocaleString('en-IN')}</span>
          </div>
        ))}
        {!logs.length ? <p className="text-sm text-slate-500">Live audit entries will appear as marketplace data changes.</p> : null}
      </div>
    </div>
  );
}

export function VendorReviewManager() {
  const { data } = useQuery(FETCH_BOOKINGS_QUERY);
  const bookingsWithReviews = (data?.fetchBookingDetails ?? []).filter((b: any) => b.review);

  return (
    <div className="panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-tight">Review center</h2>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-600">
          {bookingsWithReviews.length} reviews
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {bookingsWithReviews.length ? (
          bookingsWithReviews.map((booking: any) => (
            <div key={booking.id} className="rounded-[24px] border border-rose-100 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900">{booking.service.title}</p>
                <div className="flex gap-1 text-rose-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < booking.review.rating ? 'fill-current' : 'opacity-20'}>★</span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 italic">"{booking.review.comment ?? 'No comment provided.'}"</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Customer: {booking.user.fullName} • Booking #{booking.id.slice(-6)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Reviews from your clients will appear here once they complete their bookings.</p>
        )}
      </div>
    </div>
  );
}
