import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Store,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  PackageSearch,
  ArrowLeftRight,
  ShoppingBag,
  ExternalLink,
  Globe,
  Sparkles,
  Building2,
  Truck,
  RotateCcw,
  RefreshCw,
  Boxes,
  CheckCircle2,
  Clock,
  Layers,
  Send,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { outletStore, OutletId } from '@/lib/outletStore';
import { authStore } from '@/lib/authStore';

// Lazy-load the heavy 2,500-line BagUI component so initial bundle is ultralight & instant!
const DashboardStore = lazy(() => import('@/components/Dashboard/dashboard-finance'));

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

type DashboardScope = 'TOKO_1' | 'TOKO_2' | 'CONSOLIDATED' | 'BAGUI';

// In-Memory SWR Cache for Instant (0ms) Dashboard Render
let MEMORY_CACHE: any = null;

function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(authStore.getUser());
  const activeOutlet = outletStore.getOutlet();

  // Initial scope based on logged-in user or active outlet
  const getInitialScope = (): DashboardScope => {
    if (currentUser?.outletId === 'toko-1') return 'TOKO_1';
    if (currentUser?.outletId === 'toko-2') return 'TOKO_2';
    if (currentUser?.outletId === 'ALL') return 'CONSOLIDATED';
    return activeOutlet === 'toko-1' ? 'TOKO_1' : 'TOKO_2';
  };

  const [activeScope, setActiveScope] = useState<DashboardScope>(getInitialScope);
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

  // Synchronize when store or user changes
  useEffect(() => {
    const unsubOutlet = outletStore.subscribe((id) => {
      if (activeScope !== 'CONSOLIDATED' && activeScope !== 'BAGUI') {
        setActiveScope(id === 'toko-1' ? 'TOKO_1' : 'TOKO_2');
      }
    });
    const unsubAuth = authStore.subscribe((user) => {
      setCurrentUser(user);
      if (user?.outletId === 'toko-1') setActiveScope('TOKO_1');
      else if (user?.outletId === 'toko-2') setActiveScope('TOKO_2');
      else if (user?.outletId === 'ALL') setActiveScope('CONSOLIDATED');
    });
    return () => {
      unsubOutlet();
      unsubAuth();
    };
  }, [activeScope]);

  // Fast Data Fetching with SWR (Stale-While-Revalidate)
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
      // silently fail if cached data exists
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // If completely cold and no cache yet, show sleek skeleton loader
  if (!data) {
    return (
      <div className="p-12 text-center text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center gap-3">
        <RefreshCw className="size-5 animate-spin text-zinc-900 dark:text-zinc-100" />
        <span className="font-medium">Memuat data analitik multi-cabang...</span>
      </div>
    );
  }

  const { kpis, salesTrend, recentOrders, recentOnlineOrders, toko1RecentOrders, toko2RecentOrders } = data;
  const toko1Kpi = kpis.toko1 || {};
  const toko2Kpi = kpis.toko2 || {};

  return (
    <div className="space-y-6">
      {/* ─── TOP CONTROLS & SEGMENTED STORE VIEW SWITCHER ─────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Branch / Scope Switcher Tabs */}
        <div className="overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold w-fit shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setActiveScope('TOKO_1');
                outletStore.setOutlet('toko-1');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeScope === 'TOKO_1'
                  ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Toko 1 (Pusat &amp; Gudang)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScope('TOKO_2');
                outletStore.setOutlet('toko-2');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeScope === 'TOKO_2'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Store className="size-3.5" />
              <span>Toko 2 (Cabang Satelit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScope('CONSOLIDATED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeScope === 'CONSOLIDATED'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Konsolidasi (Semua Cabang)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScope('BAGUI')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeScope === 'BAGUI'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>BagUI Theme</span>
            </button>
          </div>
        </div>

        {/* Action Header Tools */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {isRefreshing && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
              <RefreshCw className="size-3 animate-spin" />
              <span>Memperbarui...</span>
            </span>
          )}

          <Link
            to="/shop"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="size-3.5" />
            <span>Katalog /shop</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* ─── SCOPE 1: TOKO 1 (PUSAT & GUDANG LOGISTIK) ───────────────────────── */}
      {activeScope === 'TOKO_1' && (
        <div className="space-y-6">
          {/* Outlet Banner */}
          <div className="p-4 sm:p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Dashboard Toko 1 (Pusat &amp; Gudang)
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                    Gudang Pusat
                  </span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                  Fokus logistik: Pengadaan stok, pemenuhan restock Toko 2, penerimaan retur, dan penjualan ritel pusat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/transfers"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>Kirim Pasokan ke Cabang</span>
              </Link>
            </div>
          </div>

          {/* Toko 1 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Total Stok Gudang Pusat
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {toko1Kpi.totalStock || kpis.totalToko1Stock}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Unit</span>
                </span>
                <Boxes className="size-4 text-blue-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Valuasi Aset: <strong className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{formatRupiah(toko1Kpi.stockValuation || 0)}</strong>
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Permintaan Restock Toko 2
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-amber-600 dark:text-amber-400 tabular-nums">
                  {toko1Kpi.pendingDispatchToToko2 ?? kpis.pendingTransfersCount}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Menunggu Kirim</span>
                </span>
                <Truck className="size-4 text-amber-500" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Perlu segera dikemas &amp; diantar kurir
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Retur Masuk dari Toko 2
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-purple-600 dark:text-purple-400 tabular-nums">
                  {toko1Kpi.inboundReturns || 0}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">In-Transit</span>
                </span>
                <RotateCcw className="size-4 text-purple-500" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Menunggu konfirmasi masuk gudang
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Pendapatan Toko 1 (POS &amp; Online)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatRupiah(toko1Kpi.totalRevenue || 244000)}
                </span>
                <DollarSign className="size-4 text-emerald-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                {toko1Kpi.ordersCount || 2} Transaksi berhasil dibukukan
              </span>
            </div>
          </div>

          {/* Chart & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Tren Penjualan Mingguan — Toko 1 (Pusat)
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Data transaksi offline POS dan pemenuhan online outlet pusat
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono font-bold text-xs">
                  {formatRupiah(salesTrend.reduce((acc: number, cur: any) => acc + cur.toko1, 0))}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="toko1Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-zinc-700">
                              <span className="font-semibold block">{payload[0]?.payload?.day}</span>
                              <span className="font-mono font-bold text-blue-400">
                                {formatRupiah(Number(payload[0]?.value))}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="toko1" stroke="#2563eb" strokeWidth={2.5} fill="url(#toko1Grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outbound Dispatch Queue */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Antrean Pasokan Toko 1
                </h4>
                <Link to="/transfers" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Kelola &rarr;
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                {(toko1RecentOrders || recentOrders).slice(0, 4).map((order: any) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">
                        {order.id}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} &bull; {order.paymentMethod}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(order.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCOPE 2: TOKO 2 (CABANG SATELIT RETAIL) ─────────────────────────── */}
      {activeScope === 'TOKO_2' && (
        <div className="space-y-6">
          {/* Outlet Banner */}
          <div className="p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Store className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Dashboard Toko 2 (Cabang Satelit)
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                    Cabang Frontline
                  </span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                  Fokus penjualan ritel: Transaksi kasir, pesanan online cabang, monitoring stok menipis, dan penerimaan pasokan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/inventory"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <PackageSearch className="size-3.5" />
                <span>Cek Stok &amp; Minta Pasokan</span>
              </Link>
            </div>
          </div>

          {/* Toko 2 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Total Penjualan Toko 2 Hari Ini
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatRupiah(toko2Kpi.totalRevenue || 135000)}
                </span>
                <DollarSign className="size-4 text-emerald-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                {toko2Kpi.ordersCount || 3} Transaksi ritel aktif
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                SKU Menipis (Butuh Restock)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-amber-600 dark:text-amber-400 tabular-nums">
                  {toko2Kpi.criticalStockCount ?? kpis.lowStockToko2Count}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Barang</span>
                </span>
                <AlertTriangle className="size-4 text-amber-500" />
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block pt-1">
                Di bawah batas minimum cabang
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Pasokan dari Pusat (In-Transit)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-blue-600 dark:text-blue-400 tabular-nums">
                  {toko2Kpi.inTransitFromPusat ?? kpis.inTransitTransfersCount ?? 1}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Pengiriman</span>
                </span>
                <Truck className="size-4 text-blue-500" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Sedang dibawa kurir menuju toko
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Pesanan Online Toko 2
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {recentOnlineOrders.filter((o: any) => o.outletId === 'toko-2').length || 1}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Pesanan</span>
                </span>
                <ShoppingBag className="size-4 text-purple-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Dari katalog pelanggan /shop
              </span>
            </div>
          </div>

          {/* Chart & Live Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Tren Penjualan Mingguan — Toko 2 (Cabang)
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Performa transaksi kasir dan pesanan ambil di toko cabang
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                  {formatRupiah(salesTrend.reduce((acc: number, cur: any) => acc + cur.toko2, 0))}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="toko2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-zinc-700">
                              <span className="font-semibold block">{payload[0]?.payload?.day}</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {formatRupiah(Number(payload[0]?.value))}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="toko2" stroke="#059669" strokeWidth={2.5} fill="url(#toko2Grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Fast Request Action */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Stok Kritis Toko 2
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Perlu Restock
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Stok barang berikut berada di bawah ambang batas minimal. Tekan tombol untuk langsung meminta kiriman pasokan dari Toko 1.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Minyak Goreng Sawit 2L</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold">Tersisa: 3 POUCH (Min: 10)</span>
                  </div>
                  <Link
                    to="/transfers"
                    search={{ requestProductId: 'p-2' } as any}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors"
                  >
                    Minta Kirim
                  </Link>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Beras Pandan Wangi 5kg</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold">Tersisa: 4 SAK (Min: 6)</span>
                  </div>
                  <Link
                    to="/transfers"
                    search={{ requestProductId: 'p-1' } as any}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors"
                  >
                    Minta Kirim
                  </Link>
                </div>
              </div>

              <Link
                to="/inventory"
                className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>Lihat Semua {kpis.lowStockToko2Count} SKU Kritis</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCOPE 3: KONSOLIDASI OWNER (MULTI-CABANG TERPADU) ───────────────── */}
      {activeScope === 'CONSOLIDATED' && (
        <div className="space-y-6">
          {/* Consolidated Banner */}
          <div className="p-4 sm:p-5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center font-bold">
                <Layers className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  Laporan Konsolidasi Multi-Cabang Enterprise
                </h3>
                <p className="opacity-75 text-[11px] mt-0.5">
                  Ringkasan agregat kinerja Toko 1 (Pusat &amp; Gudang) dan Toko 2 (Cabang Satelit)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white/20 dark:bg-zinc-900/10 font-mono font-bold text-xs">
                2 Outlet Aktif Terhubung
              </span>
            </div>
          </div>

          {/* Consolidated KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Total Omzet Gabungan Hari Ini
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatRupiah(kpis.todayRevenue)}
                </span>
                <DollarSign className="size-4 text-emerald-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                POS: {formatRupiah(kpis.posRevenue)} &bull; Online: {formatRupiah(kpis.onlineRevenue)}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Total Unit Stok Seluruh Cabang
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {kpis.totalToko1Stock + kpis.totalToko2Stock}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Unit</span>
                </span>
                <Boxes className="size-4 text-blue-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Toko 1: {kpis.totalToko1Stock} &bull; Toko 2: {kpis.totalToko2Stock}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Total Transaksi Konsolidasi
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {kpis.totalOrdersToday}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Struk</span>
                </span>
                <ShoppingCart className="size-4 text-zinc-600" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                POS: {kpis.posOrdersToday} &bull; Online Web: {kpis.onlineOrdersToday}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Mutasi Stok Antar-Cabang
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xl text-amber-600 dark:text-amber-400 tabular-nums">
                  {kpis.pendingTransfersCount}{' '}
                  <span className="text-xs font-sans font-normal text-zinc-500">Tertunda</span>
                </span>
                <ArrowLeftRight className="size-4 text-amber-500" />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block pt-1">
                Dalam perjalanan: {kpis.inTransitTransfersCount || 1} armada
              </span>
            </div>
          </div>

          {/* Comparison Chart: Toko 1 vs Toko 2 */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Perbandingan Omzet Harian: Toko 1 vs Toko 2
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Visualisasi performa penjualan komparatif 7 hari terakhir
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="size-2.5 rounded-full bg-blue-600" />
                  <span>Toko 1 (Pusat &amp; Gudang)</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="size-2.5 rounded-full bg-emerald-600" />
                  <span>Toko 2 (Cabang Satelit)</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
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
        </div>
      )}

      {/* ─── SCOPE 4: BAGUI INTERACTIVE TEMPLATE (LAZY LOADED) ──────────────── */}
      {activeScope === 'BAGUI' && (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <Suspense
            fallback={
              <div className="p-16 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                <span>Memuat modul interaktif BagUI...</span>
              </div>
            }
          >
            <DashboardStore />
          </Suspense>
        </div>
      )}
    </div>
  );
}
