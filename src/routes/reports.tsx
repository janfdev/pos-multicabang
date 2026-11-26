import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Filter,
  Download,
  Building2,
  Store,
  Layers,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards, StatItem } from "@/components/dashboard/stats-cards";
import { BagTable, ColumnDef, TableRow } from "@/components/dashboard/bag-table";
import { authStore } from "@/lib/authStore";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

interface ProductProfitReport {
  productId: string;
  sku: string;
  name: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

interface FinancialReportData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  productBreakdown: ProductProfitReport[];
}

function ReportsPage() {
  const [currentUser, setCurrentUser] = useState(() => authStore.getUser());
  const isOwner = !currentUser || currentUser.outletId === "ALL";
  const lockedOutlet =
    currentUser?.outletId === "toko-1" || currentUser?.outletId === "toko-2"
      ? currentUser.outletId
      : null;

  const [data, setData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outletFilter, setOutletFilter] = useState<string>(() => lockedOutlet || "ALL");

  useEffect(() => {
    const unsub = authStore.subscribe((u) => {
      setCurrentUser(u);
      if (u?.outletId === "toko-1" || u?.outletId === "toko-2") {
        setOutletFilter(u.outletId);
      } else {
        setOutletFilter("ALL");
      }
    });
    return unsub;
  }, []);

  const loadReport = () => {
    setLoading(true);
    setError(null);
    const url =
      outletFilter === "ALL"
        ? "/api/analytics/financial-report"
        : `/api/analytics/financial-report?outletId=${outletFilter}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat laporan keuangan dari server. Silakan coba lagi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReport();
  }, [outletFilter]);

  const stats: StatItem[] = useMemo(() => {
    if (error && !data) {
      return [
        { label: "Total Omzet Penjualan", value: "-", delta: "Gagal muat" },
        { label: "Beban Pokok Penjualan (HPP)", value: "-", delta: "Gagal muat" },
        { label: "Laba Kotor (Gross Profit)", value: "-", delta: "Gagal muat" },
        { label: "Rata-rata Margin Laba", value: "-", delta: "Gagal muat" },
      ];
    }
    if (!data) {
      return [
        { label: "Total Omzet Penjualan", value: "Memuat...", delta: "0%" },
        { label: "Beban Pokok Penjualan (HPP)", value: "Memuat...", delta: "0%" },
        { label: "Laba Kotor (Gross Profit)", value: "Memuat...", delta: "0%" },
        { label: "Rata-rata Margin Laba", value: "Memuat...", delta: "0%" },
      ];
    }
    return [
      {
        label: "Total Omzet Penjualan",
        value: `Rp ${data.totalRevenue.toLocaleString("id-ID")}`,
        delta: "+14.8%",
      },
      {
        label: "Beban Pokok Penjualan (HPP)",
        value: `Rp ${data.totalCost.toLocaleString("id-ID")}`,
        delta: "Biaya Stok",
      },
      {
        label: "Laba Kotor (Gross Profit)",
        value: `Rp ${data.grossProfit.toLocaleString("id-ID")}`,
        delta: "+18.2%",
      },
      {
        label: "Rata-rata Margin Laba",
        value: `${data.grossMarginPercent}%`,
        delta: "Kinerja Sehat",
      },
    ];
  }, [data]);

  const columns: ColumnDef[] = useMemo(
    () => [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Nama Produk Sembako" },
      { key: "category", label: "Kategori" },
      { key: "unitsSold", label: "Volume Terjual", numeric: true },
      { key: "revenue", label: "Total Omzet" },
      { key: "cost", label: "Total HPP" },
      { key: "profit", label: "Laba Kotor" },
      { key: "margin", label: "Margin" },
    ],
    [],
  );

  const rows: TableRow[] = useMemo(() => {
    if (!data?.productBreakdown) return [];
    return data.productBreakdown.map((p) => ({
      id: p.productId,
      status: p.marginPercent >= 20 ? "HIGH MARGIN" : "NORMAL",
      cells: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        unitsSold: `${p.unitsSold} unit`,
        revenue: `Rp ${p.totalRevenue.toLocaleString("id-ID")}`,
        cost: `Rp ${p.totalCost.toLocaleString("id-ID")}`,
        profit: `Rp ${p.grossProfit.toLocaleString("id-ID")}`,
        margin: `${p.marginPercent}%`,
      },
    }));
  }, [data]);

  return (
    <DashboardLayout title="Analitik & Laporan Penjualan Multi-Cabang">
      {error && (
        <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadReport}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Muat Ulang</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <StatsCards stats={stats} />

      {/* Outlet Filter Switcher */}
      <div className="px-6 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => setOutletFilter("ALL")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    outletFilter === "ALL"
                      ? "bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Layers size={13} />
                  Konsolidasi Semua Cabang
                </button>
                <button
                  type="button"
                  onClick={() => setOutletFilter("toko-1")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    outletFilter === "toko-1"
                      ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Building2 size={13} />
                  Toko 1 (Pusat &amp; Gudang)
                </button>
                <button
                  type="button"
                  onClick={() => setOutletFilter("toko-2")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    outletFilter === "toko-2"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Store size={13} />
                  Toko 2 (Cabang Satelit)
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-gray-800 dark:text-neutral-200">
                {lockedOutlet === "toko-1" ? <Building2 size={13} className="text-blue-600" /> : <Store size={13} className="text-emerald-600" />}
                <span>
                  Laporan Khusus: {lockedOutlet === "toko-1" ? "Toko 1 (Pusat & Gudang)" : "Toko 2 (Cabang Satelit)"}
                </span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!data) return;
              const csv = [
                "SKU,Nama Produk,Kategori,Terjual,Omzet,HPP,Laba Kotor,Margin",
                ...data.productBreakdown.map(
                  (p) =>
                    `${p.sku},"${p.name}",${p.category},${p.unitsSold},${p.totalRevenue},${p.totalCost},${p.grossProfit},${p.marginPercent}%`,
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `laporan-keuangan-${outletFilter}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 shadow-2xs cursor-pointer"
          >
            <Download size={13} />
            Export Laporan CSV
          </button>
        </div>
      </div>

      {/* Table Breakdown */}
      <div className="pt-2">
        <BagTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Cari nama produk sembako atau SKU..."
        />
      </div>
    </DashboardLayout>
  );
}
export default ReportsPage;
