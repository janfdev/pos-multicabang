import { createFileRoute } from '@tanstack/react-router';
import DashboardStore from '@/components/dashboard/dashboard-store';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardStore />;
}
