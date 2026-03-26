import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard-shell';
import { PartnerDashboardView } from '@/components/dashboard-panels';

export const metadata: Metadata = {
  title: 'Partner Panel',
  robots: {
    index: false,
    follow: false
  }
};

export default function PartnerDashboardPage() {
  return (
    <DashboardShell
      requiredRole="PARTNER"
      tone="partner"
      eyebrow="Partner Panel"
      title="Partner Panel"
      description=""
      highlights={[]}
      heroVariant="hidden"
    >
      <PartnerDashboardView />
    </DashboardShell>
  );
}
