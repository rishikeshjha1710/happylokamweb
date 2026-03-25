import { DashboardShell } from '@/components/dashboard-shell';
import { PartnerDashboardView } from '@/components/dashboard-panels';

export const metadata = {
  title: 'Partner Panel'
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
