import { createFileRoute } from '@tanstack/react-router';
import DashboardStore from '@/components/Dashboard/dashboard-finance';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return <DashboardStore />;
}
