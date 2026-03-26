import type { Metadata } from 'next';
import { DashboardRouter } from '@/components/dashboard-router';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardPage() {
  return <DashboardRouter />;
}
