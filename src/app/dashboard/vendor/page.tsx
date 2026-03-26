import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Partner Panel',
  robots: {
    index: false,
    follow: false
  }
};

export default function LegacyVendorDashboardPage() {
  redirect('/dashboard/partner');
}
