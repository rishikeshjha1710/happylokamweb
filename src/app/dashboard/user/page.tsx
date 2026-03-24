import { UserDashboardView } from '@/components/dashboard-panels';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata = {
  title: 'Profile'
};

export default function UserDashboardPage() {
  return (
    <DashboardShell
      requiredRole="USER"
      tone="user"
      eyebrow="User Panel"
      title="User Profile"
      description=""
      highlights={[]}
      heroVariant="hidden"
    >
      <UserDashboardView />
    </DashboardShell>
  );
}
