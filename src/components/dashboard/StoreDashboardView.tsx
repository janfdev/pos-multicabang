import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Store, Layers, RefreshCw, AlertTriangle } from "lucide-react";
import { StatsCards, StatItem } from "@/components/dashboard/stats-cards";
import { BagTable, ColumnDef, TableRow } from "@/components/dashboard/bag-table";
import { outletStore } from "@/lib/outletStore";

export type DashboardMode = "hq" | "toko-1" | "toko-2";

interface DashboardApiData {
  kpis: {
    totalProducts: number;
    totalToko1Stock: number;
    totalToko2Stock: number;
    lowStockToko1Count: number;
    lowStockToko2Count: number;
    pendingTransfersCount: number;
    inTransitTransfersCount: number;
    pendingOnlineOrdersCount: number;
    totalOrdersToday: number;
    posRevenue: number;
    onlineRevenue: number;
    todayRevenue: number;
    toko1: {
      name: string;
      totalStock: number;
      stockValuation: number;
      posRevenue: number;
      onlineRevenue: number;
      totalRevenue: number;
      ordersCount: number;
      pendingDispatchToToko2: number;
      inboundReturns: number;
    };
    toko2: {
      name: string;
      totalStock: number;
      stockValuation: number;
      posRevenue: number;
      onlineRevenue: number;
      totalRevenue: number;
      ordersCount: number;
      criticalStockCount: number;
      inTransitFromPusat: number;
      pendingRestockRequests: number;
    };
  };
}

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

export function StoreDashboardView({
  mode,
  canSwitchStore,
  onSelectMode,
}: {
  mode: DashboardMode;
  canSwitchStore: boolean;
  onSelectMode: (next: DashboardMode) => void;
}) {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch {
      setError("Gagal memuat data dashboard real-time dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [mode]);

  const stats: StatItem[] = useMemo(() => {
    if (!data) {
      return [
        { label: "Omzet Penjualan", value: loading ? "Memuat..." : "-", delta: "Sinkronisasi" },
        { label: "Stok Fisik", value: loading ? "Memuat..." : "-", delta: "Sinkronisasi" },
        { label: "Mutasi & Logistik", value: loading ? "Memuat..." : "-", delta: "Sinkronisasi" },
        { label: "Pesanan & Alert", value: loading ? "Memuat..." : "-", delta: "Sinkronisasi" },
      ];
    }

    const k = data.kpis;
    if (mode === "toko-1") {
      return [
        {
          label: "Total Omzet Toko 1",
          value: fmtRp(k.toko1.totalRevenue),
          delta: `${k.toko1.ordersCount} transaksi`,
        },
        {
          label: "Stok Fisik Gudang T1",
          value: `${k.toko1.totalStock} Unit`,
          delta: `${k.totalProducts} SKU aktif`,
        },
        {
          label: "Valuasi Aset Gudang",
          value: fmtRp(k.toko1.stockValuation),
          delta: `${k.lowStockToko1Count} SKU menipis`,
        },
        {
          label: "Permintaan Kirim ke T2",
          value: `${k.toko1.pendingDispatchToToko2} Dokumen`,
          delta: `${k.inTransitTransfersCount} in-transit`,
        },
      ];
    }

    if (mode === "toko-2") {
      return [
        {
          label: "Total Omzet Toko 2",
          value: fmtRp(k.toko2.totalRevenue),
          delta: `${k.toko2.ordersCount} transaksi`,
        },
        {
          label: "Stok Rak Display T2",
          value: `${k.toko2.totalStock} Unit`,
          delta:
            k.toko2.criticalStockCount > 0
              ? `-${k.toko2.criticalStockCount} SKU kritis`
              : "Stok aman",
        },
        {
          label: "Pasokan OTW dari Pusat",
          value: `${k.toko2.inTransitFromPusat} Pengiriman`,
          delta: `${k.toko2.pendingRestockRequests} menunggu acc`,
        },
        {
          label: "Valuasi Stok Cabang",
          value: fmtRp(k.toko2.stockValuation),
          delta: `Online: ${fmtRp(k.toko2.onlineRevenue)}`,
        },
      ];
    }

    // Owner HQ Consolidated
    return [
      {
        label: "Total Omzet Gabungan",
        value: fmtRp(k.todayRevenue),
        delta: `${k.totalOrdersToday} total order`,
      },
      {
        label: "Total Stok Multi-Cabang",
        value: `${k.totalToko1Stock + k.totalToko2Stock} Unit`,
        delta: `T1: ${k.totalToko1Stock} | T2: ${k.totalToko2Stock}`,
      },
      {
        label: "Mutasi Antar-Cabang",
        value: `${k.inTransitTransfersCount} In-Transit`,
        delta: `${k.pendingTransfersCount} menunggu acc`,
      },
      {
        label: "Antrean Pesanan Online",
        value: `${k.pendingOnlineOrdersCount} Menunggu`,
        delta: `Online: ${fmtRp(k.onlineRevenue)}`,
      },
    ];
  }, [data, loading, mode]);

  const columns: ColumnDef[] = useMemo(
    () => [
      { key: "item", label: "Modul / Ringkasan Operasional" },
      { key: "statusSummary", label: "Kondisi Real-Time" },
      { key: "metric", label: "Metrik Aktual" },
      { key: "tindakan", label: "Aksi Cepat" },
    ],
    []
  );

  const rows: TableRow[] = useMemo(() => {
    if (!data) return [];
    const k = data.kpis;

    if (mode === "toko-1") {
      return [
        {
          id: "t1-pos",
          status: "AKTIF",
          cells: {
            item: "Penjualan POS Kasir Toko 1",
            statusSummary: "Operasional Kasir Pusat",
            metric: fmtRp(k.toko1.posRevenue),
            tindakan: "Buka Kasir POS Toko 1",
          },
        },
        {
          id: "t1-inv",
          status: k.lowStockToko1Count > 0 ? "PERHATIAN" : "AMAN",
          cells: {
            item: "Persediaan Gudang Utama",
            statusSummary: `${k.lowStockToko1Count} SKU di bawah ambang minimum`,
            metric: `${k.toko1.totalStock} Unit`,
            tindakan: "Kelola Stok & Opname",
          },
        },
        {
          id: "t1-trf",
          status: k.toko1.pendingDispatchToToko2 > 0 ? "MENUNGGU" : "AMAN",
          cells: {
            item: "Permintaan Pasokan dari Toko 2",
            statusSummary: `${k.toko1.pendingDispatchToToko2} permintaan siap diproses`,
            metric: `${k.inTransitTransfersCount} pengiriman berjalan`,
            tindakan: "Proses Mutasi Stok",
          },
        },
        {
          id: "t1-online",
          status: "AKTIF",
          cells: {
            item: "Pesanan Online Toko 1",
            statusSummary: "Pickup & Delivery Radius 5 KM",
            metric: fmtRp(k.toko1.onlineRevenue),
            tindakan: "Buka Pesanan Online",
          },
        },
      ];
    }

    if (mode === "toko-2") {
      return [
        {
          id: "t2-pos",
          status: "AKTIF",
          cells: {
            item: "Penjualan POS Kasir Toko 2",
            statusSummary: "Operasional Cabang Kesambi",
            metric: fmtRp(k.toko2.posRevenue),
            tindakan: "Buka Kasir POS Toko 2",
          },
        },
        {
          id: "t2-inv",
          status: k.toko2.criticalStockCount > 0 ? "KRITIS" : "AMAN",
          cells: {
            item: "Ketersediaan Stok Rak Display",
            statusSummary: `${k.toko2.criticalStockCount} SKU perlu restock segera`,
            metric: `${k.toko2.totalStock} Unit`,
            tindakan: "Ajukan Restock ke Pusat",
          },
        },
        {
          id: "t2-track",
          status: k.toko2.inTransitFromPusat > 0 ? "IN_TRANSIT" : "AMAN",
          cells: {
            item: "Pasokan Masuk dari Gudang T1",
            statusSummary: `${k.toko2.inTransitFromPusat} armada dalam perjalanan`,
            metric: `${k.toko2.pendingRestockRequests} pengajuan terbuka`,
            tindakan: "Pantau Live Tracking",
          },
        },
        {
          id: "t2-online",
          status: "AKTIF",
          cells: {
            item: "Pesanan Online Toko 2",
            statusSummary: "Pickup & Delivery Cabang Kesambi",
            metric: fmtRp(k.toko2.onlineRevenue),
            tindakan: "Buka Pesanan Online",
          },
        },
      ];
    }

    // HQ Consolidated rows
    return [
      {
        id: "hq-t1",
        status: "AKTIF",
        cells: {
          item: "Toko 1 — Pusat & Gudang Utama",
          statusSummary: `${k.toko1.totalStock} unit fisik | ${k.toko1.ordersCount} order`,
          metric: fmtRp(k.toko1.totalRevenue),
          tindakan: "Masuk Dashboard Toko 1",
        },
      },
      {
        id: "hq-t2",
        status: k.toko2.criticalStockCount > 0 ? "PERHATIAN" : "AKTIF",
        cells: {
          item: "Toko 2 — Cabang Satelit Kesambi",
          statusSummary: `${k.toko2.totalStock} unit fisik | ${k.toko2.criticalStockCount} SKU kritis`,
          metric: fmtRp(k.toko2.totalRevenue),
          tindakan: "Masuk Dashboard Toko 2",
        },
      },
      {
        id: "hq-trf",
        status: k.inTransitTransfersCount > 0 ? "IN_TRANSIT" : "AMAN",
        cells: {
          item: "Distribusi & Mutasi Antar-Cabang",
          statusSummary: `${k.pendingTransfersCount} menunggu acc | ${k.inTransitTransfersCount} di jalan`,
          metric: `${k.pendingTransfersCount + k.inTransitTransfersCount} aktif`,
          tindakan: "Pantau Live Tracking",
        },
      },
      {
        id: "hq-rep",
        status: "AKTIF",
        cells: {
          item: "Laporan Keuangan & Margin Laba",
          statusSummary: `POS: ${fmtRp(k.posRevenue)} | Online: ${fmtRp(k.onlineRevenue)}`,
          metric: fmtRp(k.todayRevenue),
          tindakan: "Buka Laporan Laba Rugi",
        },
      },
    ];
  }, [data, mode]);

  const handleActionClick = (actionText: string) => {
    const act = actionText.toLowerCase();
    if (act.includes("dashboard toko 1")) {
      outletStore.setOutlet("toko-1");
      onSelectMode("toko-1");
      return;
    }
    if (act.includes("dashboard toko 2")) {
      outletStore.setOutlet("toko-2");
      onSelectMode("toko-2");
      return;
    }
    if (act.includes("kasir pos")) {
      if (mode === "toko-1" || mode === "toko-2") outletStore.setOutlet(mode);
      navigate({ to: "/pos" });
      return;
    }
    if (act.includes("tracking")) {
      navigate({ to: "/tracking" });
      return;
    }
    if (act.includes("online")) {
      navigate({ to: "/online-orders" });
      return;
    }
    if (act.includes("mutasi") || act.includes("restock")) {
      navigate({ to: "/transfers" });
      return;
    }
    if (act.includes("stok") || act.includes("opname")) {
      navigate({ to: "/inventory" });
      return;
    }
    if (act.includes("laporan")) {
      navigate({ to: "/reports" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Store Switcher Bar (Visible for Owner / HQ) */}
      <div className="px-6 pt-5 flex flex-wrap items-center justify-between gap-3">
        {canSwitchStore ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectMode("hq")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "hq"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
            >
              <Layers size={13} />
              <span>Konsolidasi HQ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                outletStore.setOutlet("toko-1");
                onSelectMode("toko-1");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "toko-1"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
            >
              <Building2 size={13} />
              <span>Dashboard Toko 1 (Pusat)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                outletStore.setOutlet("toko-2");
                onSelectMode("toko-2");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "toko-2"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
            >
              <Store size={13} />
              <span>Dashboard Toko 2 (Cabang)</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
            Menampilkan data operasional khusus{" "}
            <span className="font-bold text-gray-900 dark:text-neutral-100">
              {mode === "toko-1" ? "Toko 1 (Pusat & Gudang)" : "Toko 2 (Cabang Satelit)"}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {error && (
        <div className="mx-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadAnalytics}
            className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <StatsCards stats={stats} />

      <div className="pt-2">
        <BagTable
          columns={columns}
          rows={rows}
          onActionClick={handleActionClick}
          searchPlaceholder="Cari ringkasan modul operasional..."
        />
      </div>
    </div>
  );
}
