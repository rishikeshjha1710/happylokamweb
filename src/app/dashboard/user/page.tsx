import type { Metadata } from 'next';
import { UserDashboardView } from '@/components/dashboard-panels';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Profile',
  robots: {
    index: false,
    follow: false
  }
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
