import type { Metadata } from 'next';
import { AdminDashboardView } from '@/components/dashboard-panels';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      requiredRole="ADMIN"
      tone="admin"
      eyebrow="Admin Panel"
      title="Admin Panel"
      description=""
      highlights={[]}
      heroVariant="hidden"
    >
      <AdminDashboardView />
    </DashboardShell>
  );
}
