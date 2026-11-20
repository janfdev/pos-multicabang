import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards, StatItem } from "@/components/dashboard/stats-cards";
import { BagTable, ColumnDef, TableRow } from "@/components/dashboard/bag-table";
import { authStore, UserProfile } from "@/lib/authStore";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStore.getUser());

  useEffect(() => {
    const unsub = authStore.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const isToko1 = currentUser?.outletId === "toko-1";
  const isToko2 = currentUser?.outletId === "toko-2";

  const title = isToko1
    ? "Dashboard Operasional — Toko 1 (Pusat & Gudang)"
    : isToko2
      ? "Dashboard Operasional — Toko 2 (Cabang Satelit)"
      : "Dashboard Eksekutif & Analitik Terpadu";

  const stats: StatItem[] = useMemo(() => {
    if (isToko1) {
      return [
        { label: "Omset Penjualan T1", value: "Rp 30.400.000", delta: "+16% minggu ini" },
        { label: "Stok Fisik Gudang", value: "797 Unit", delta: "12 SKU Lengkap" },
        { label: "Permintaan Kirim ke T2", value: "1 Mutasi", delta: "60 unit siap kirim" },
        { label: "Kas Modal Awal Kasir", value: "Rp 500.000", delta: "Shift Pagi Aktif" },
      ];
    }
    if (isToko2) {
      return [
        { label: "Omset Penjualan T2", value: "Rp 14.040.000", delta: "+9% minggu ini" },
        { label: "Stok Display di Rak", value: "126 Unit", delta: "5 SKU Kritis" },
        { label: "Pasokan Masuk dari T1", value: "60 Unit OTW", delta: "Armada Kurir Ahmad" },
        { label: "Kas Modal Awal Kasir", value: "Rp 300.000", delta: "Shift Pagi Aktif" },
      ];
    }
    return [
      { label: "Total Omzet Gabungan", value: "Rp 48.290.000", delta: "+ 14%" },
      { label: "Total Stok Multi-Cabang", value: "923 Unit", delta: "+ 65 unit" },
      { label: "Mutasi In-Transit", value: "1 Pengiriman", delta: "60 unit jalan" },
      { label: "Rasio Offline vs Online", value: "92% : 8%", delta: "Seimbang" },
    ];
  }, [isToko1, isToko2]);

  const columns: ColumnDef[] = useMemo(
    () => [
      { key: "item", label: "Aktivitas / Modul Operasional" },
      { key: "statusSummary", label: "Status Real-time" },
      { key: "metric", label: "Volume / Nilai" },
      { key: "tindakan", label: "Tindakan" },
    ],
    [],
  );

  const rows: TableRow[] = useMemo(() => {
    if (isToko1) {
      return [
        {
          id: "t1-1",
          status: "ACTIVE",
          cells: {
            item: "Terminal Kasir POS Toko 1",
            statusSummary: "Kasir Aktif (Rian Kurniawan)",
            metric: "42 Transaksi Offline",
            tindakan: "Buka Terminal Kasir (/pos)",
          },
        },
        {
          id: "t1-2",
          status: "DISPATCHED",
          cells: {
            item: "Surat Jalan Mutasi ke Toko 2",
            statusSummary: "TRF-202611-001 (60 unit)",
            metric: "Kurir: Bpk. Ahmad (Armada In-Transit)",
            tindakan: "Pantau Status Pengiriman",
          },
        },
        {
          id: "t1-3",
          status: "PENDING",
          cells: {
            item: "Pesanan Belanja Online Masuk",
            statusSummary: "3 Pesanan Pick-up",
            metric: "Rp 1.450.000",
            tindakan: "Siapkan Barang (Packing)",
          },
        },
        {
          id: "t1-4",
          status: "ACTIVE",
          cells: {
            item: "Stok Gudang Distribusi",
            statusSummary: "Kondisi Aman",
            metric: "797 Unit Fisik",
            tindakan: "Siap Pasok ke Cabang Satelit",
          },
        },
      ];
    }
    if (isToko2) {
      return [
        {
          id: "t2-1",
          status: "ACTIVE",
          cells: {
            item: "Terminal Kasir POS Toko 2",
            statusSummary: "Kasir Aktif (Dewi Lestari)",
            metric: "28 Transaksi Offline",
            tindakan: "Buka Terminal Kasir (/pos)",
          },
        },
        {
          id: "t2-2",
          status: "DISPATCHED",
          cells: {
            item: "Pasokan Masuk dari Toko 1",
            statusSummary: "Surat Jalan TRF-202611-001",
            metric: "Kurir: Bpk. Ahmad (Estimasi 10 Mnt)",
            tindakan: "Pantau Status Pengiriman",
          },
        },
        {
          id: "t2-3",
          status: "PENDING",
          cells: {
            item: "Pesanan Online Cabang Kesambi",
            statusSummary: "1 Pesanan Pick-up",
            metric: "Rp 320.000",
            tindakan: "Siapkan Barang (Packing)",
          },
        },
        {
          id: "t2-4",
          status: "RESTOCK",
          cells: {
            item: "Stok Rak Display Kritis",
            statusSummary: "Beras & Minyak Menipis",
            metric: "5 SKU di Bawah Batas",
            tindakan: "Ajukan Permintaan Pasokan",
          },
        },
      ];
    }
    return [
      {
        id: "hq-1",
        status: "COMPLETED",
        cells: {
          item: "Penjualan Toko 1 (Pusat & Gudang)",
          statusSummary: "Aktif Normal",
          metric: "Rp 30.400.000",
          tindakan: "Lihat Detail Stok Toko 1",
        },
      },
      {
        id: "hq-2",
        status: "COMPLETED",
        cells: {
          item: "Penjualan Toko 2 (Cabang Satelit)",
          statusSummary: "Aktif Normal",
          metric: "Rp 14.040.000",
          tindakan: "Lihat Detail Stok Toko 2",
        },
      },
      {
        id: "hq-3",
        status: "COMPLETED",
        cells: {
          item: "Penjualan Toko Online (/shop)",
          statusSummary: "Pesanan Mengalir",
          metric: "Rp 3.850.000",
          tindakan: "Buka Toko Online (/shop)",
        },
      },
      {
        id: "hq-4",
        status: "DISPATCHED",
        cells: {
          item: "Mutasi In-Transit (T1 ➔ T2)",
          statusSummary: "TRF-202611-001",
          metric: "60 Unit (Bpk. Ahmad)",
          tindakan: "Pantau Status Pengiriman",
        },
      },
    ];
  }, [isToko1, isToko2]);

  const handleActionClick = (actionText: string) => {
    const act = actionText.toLowerCase();
    if (act.includes("/pos") || act.includes("terminal kasir")) {
      navigate({ to: "/pos" });
      return;
    }
    if (act.includes("pengiriman") || act.includes("surat jalan")) {
      navigate({ to: "/tracking" });
      return;
    }
    if (act.includes("packing") || act.includes("online")) {
      navigate({ to: "/online-orders" });
      return;
    }
    if (act.includes("pasokan") || act.includes("mutasi")) {
      navigate({ to: "/transfers" });
      return;
    }
    if (act.includes("stok") || act.includes("gudang")) {
      navigate({ to: "/inventory" });
      return;
    }
    if (act.includes("/shop")) {
      navigate({ to: "/shop" });
      return;
    }
  };

  return (
    <DashboardLayout title={title}>
      <StatsCards stats={stats} />
      <div className="pt-4">
        <BagTable
          columns={columns}
          rows={rows}
          onActionClick={handleActionClick}
          searchPlaceholder="Cari modul atau aktivitas..."
        />
      </div>
    </DashboardLayout>
  );
}
