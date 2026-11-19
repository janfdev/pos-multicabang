import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Sparkles,
  BarChart3,
  Globe,
  ExternalLink,
  ArrowLeftRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
  Store,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// BagUI Pro Store Dashboard as the primary, prominent dashboard component
const DashboardStore = lazy(() => import('@/components/Dashboard/dashboard-finance'));

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

let MEMORY_CACHE: any = null;

function DashboardPage() {
  const [showRecharts, setShowRecharts] = useState(false);
  const [data, setData] = useState<any>(() => {
    if (MEMORY_CACHE) return MEMORY_CACHE;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pos_dashboard_cache_v2');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/analytics/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        MEMORY_CACHE = json;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('pos_dashboard_cache_v2', JSON.stringify(json));
          } catch {}
        }
      }
    } catch {
      // silently use cache if offline
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
  const salesTrend = data?.salesTrend || [];

  return (
    <div className="space-y-4">
      {/* ─── TOP HEADER TOOLBAR ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/90 p-3.5 sm:px-4 sm:py-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-xs">
            <Sparkles className="size-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Dashboard Eksekutif Store
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                BagUI Pro Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Pusat kendali multi-cabang: Stok, pesanan POS &amp; online, mutasi transfer, dan analitik real-time.
            </p>
          </div>
        </div>

        {/* Action Shortcuts & Recharts Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isRefreshing && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono mr-1">
              <RefreshCw className="size-3 animate-spin" />
              <span>Syncing...</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowRecharts((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showRecharts
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700'
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>Grafik Omzet Tren</span>
            {showRecharts ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          <Link
            to="/shop"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="size-3.5" />
            <span className="hidden md:inline">Katalog /shop</span>
            <ExternalLink className="size-3" />
          </Link>

          <Link
            to="/transfers"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="size-3.5" />
            <span className="hidden md:inline">Mutasi Stok</span>
          </Link>
        </div>
      </div>

      {/* ─── OPTIONAL COLLAPSIBLE RECHARTS COMPARISON ────────────────────────── */}
      {showRecharts && (
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Grafik Perbandingan Penjualan Multi-Cabang (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Perbandingan omzet harian antara Toko 1 (Pusat &amp; Gudang) dan Toko 2 (Cabang Satelit)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="size-2.5 rounded-full bg-blue-600" />
                <span>Toko 1 (Pusat)</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="size-2.5 rounded-full bg-emerald-600" />
                <span>Toko 2 (Cabang)</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900/95 text-white p-3 rounded-xl shadow-xl text-xs backdrop-blur-md border border-zinc-700 space-y-1">
                          <span className="font-semibold block">{payload[0]?.payload?.day}</span>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-blue-400">Toko 1:</span>
                            <span className="font-mono font-bold">{formatRupiah(Number(payload[0]?.value))}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-emerald-400">Toko 2:</span>
                            <span className="font-mono font-bold">{formatRupiah(Number(payload[1]?.value))}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="toko1" fill="#2563eb" radius={[6, 6, 0, 0]} name="Toko 1" />
                <Bar dataKey="toko2" fill="#059669" radius={[6, 6, 0, 0]} name="Toko 2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── PRIMARY FIRST-CLASS DASHBOARD: BAGUI PRO STORE ─────────────────── */}
      <Suspense
        fallback={
          <div className="p-16 text-center text-zinc-400 text-xs bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 shadow-xs">
            <RefreshCw className="size-5 animate-spin text-zinc-900 dark:text-zinc-100" />
            <span className="font-medium">Memuat BagUI Pro Store Dashboard...</span>
          </div>
        }
      >
        <DashboardStore />
      </Suspense>
    </div>
  );
}
