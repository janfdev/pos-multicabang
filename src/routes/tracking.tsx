import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import LiveTrackingModule from "@/components/dashboard/live-tracking";
import { authStore, UserProfile } from "@/lib/authStore";

export const Route = createFileRoute("/tracking")({
  component: TrackingPage,
});

function TrackingPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStore.getUser());

  useEffect(() => {
    const unsub = authStore.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  return (
    <DashboardLayout title="Live Tracking Pengiriman & Armada Logistik">
      <div className="px-6 pt-5">
        <LiveTrackingModule
          currentUser={currentUser}
          onNotify={(msg) => console.log(msg)}
        />
      </div>
    </DashboardLayout>
  );
}
