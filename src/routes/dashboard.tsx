import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StoreDashboardView, DashboardMode } from "@/components/dashboard/StoreDashboardView";
import { authStore, UserProfile } from "@/lib/authStore";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { outlet?: DashboardMode } => {
    const raw = search?.outlet;
    if (raw === "toko-1" || raw === "toko-2" || raw === "hq") {
      return { outlet: raw };
    }
    return {};
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { outlet: requestedOutlet } = Route.useSearch();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStore.getUser());

  useEffect(() => {
    const unsub = authStore.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const isOwner = !currentUser || currentUser.outletId === "ALL";

  // Staff assigned to toko-1 or toko-2 are locked to their own store dashboard
  const activeMode: DashboardMode = isOwner
    ? requestedOutlet || "hq"
    : currentUser.outletId === "toko-1"
      ? "toko-1"
      : "toko-2";

  const title =
    activeMode === "toko-1"
      ? "Dashboard Toko 1 — Pusat & Gudang"
      : activeMode === "toko-2"
        ? "Dashboard Toko 2 — Cabang Satelit"
        : "Dashboard Eksekutif HQ — Multi-Cabang";

  const handleSelectMode = (next: DashboardMode) => {
    navigate({
      to: "/dashboard",
      search: { outlet: next },
    });
  };

  return (
    <DashboardLayout title={title}>
      <StoreDashboardView
        mode={activeMode}
        canSwitchStore={isOwner}
        onSelectMode={handleSelectMode}
      />
    </DashboardLayout>
  );
}
