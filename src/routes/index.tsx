import { createFileRoute } from '@tanstack/react-router';
import DashboardStore from '@/components/dashboard/dashboard-store';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <DashboardStore />;
}
