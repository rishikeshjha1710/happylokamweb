import { AdminDashboardView } from '@/components/dashboard-panels';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata = {
  title: 'Admin Panel'
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
