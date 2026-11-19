import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import DashboardStore from '@/components/Dashboard/dashboard-finance';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'OPERATIONAL' | 'BAGUI'>('OPERATIONAL');

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="p-16 text-center text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        Memuat analitik multi-cabang...
      </div>
    );
  }

  const { kpis, salesTrend, recentOrders, recentOnlineOrders } = data;

  return (
    <div className="space-y-6">
      {/* View Switcher: Operational Live vs BagUI Interactive Template */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setActiveView('OPERATIONAL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'OPERATIONAL'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs font-extrabold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Ringkasan Multi-Cabang (Live)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('BAGUI')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'BAGUI'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-2xs font-extrabold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sparkles className="size-3 text-emerald-500" />
            <span>Modern Store Dashboard (BagUI)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/shop"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="size-3.5" />
            <span>Katalog Online (/shop)</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {activeView === 'BAGUI' ? (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <DashboardStore />
        </div>
      ) : (
        <>
          {/* Module Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/90 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Ringkasan Eksekutif &amp; Operasional Cabang
                </h2>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                  Omnichannel Live
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Monitoring performa penjualan offline kasir &amp; online web store serta pergerakan stok cabang
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Link
                to="/online-orders"
                className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="size-3.5" />
                <span>Order Online</span>
                {kpis.pendingOnlineOrdersCount > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {kpis.pendingOnlineOrdersCount}
                  </span>
                )}
              </Link>
              <Link
                to="/"
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingCart className="size-3.5" />
                <span>Buka Kasir POS</span>
              </Link>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Omzet Hari Ini */}
            <div className="p-4 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Omzet Hari Ini</span>
                <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="size-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono tabular-nums block">
                  Rp {kpis.todayRevenue.toLocaleString('id-ID')}
                </span>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2 mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Kasir: Rp {kpis.posRevenue.toLocaleString('id-ID')}
                  </span>
                  <span>&bull;</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Web: Rp {kpis.onlineRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 2: Stok Gudang Toko 1 */}
            <div className="p-4 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stok Toko 1 (Gudang Pusat)</span>
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Store className="size-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono tabular-nums block">
                  {kpis.totalToko1Stock.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-normal text-zinc-400">Unit</span>
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">
                  Siap alokasi suplai cabang &amp; online
                </span>
              </div>
            </div>

            {/* KPI 3: Stok Etalase Toko 2 */}
            <div className="p-4 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stok Toko 2 (Cabang Satelit)</span>
                <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Package className="size-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 font-mono tabular-nums block">
                  {kpis.totalToko2Stock.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-normal text-zinc-400">Unit</span>
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">
                  Stok siap jual di etalase kasir cabang
                </span>
              </div>
            </div>

            {/* KPI 4: Alert Stok & Online Orders */}
            <div className="p-4 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Antrean &amp; Logistik Kritis</span>
                <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="size-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                    {kpis.lowStockToko2Count}{' '}
                    <span className="text-xs font-normal text-zinc-400">SKU</span>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {kpis.pendingOnlineOrdersCount} Order Web
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                  {kpis.pendingTransfersCount} transfer stok menunggu kirim
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Charts & Live Order Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Trend Omzet Mingguan (Recharts AreaChart) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <span>Tren Penjualan 7 Hari Terakhir</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Perbandingan omzet harian Toko 1 (Gudang) vs Toko 2 (Cabang)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500" /> Toko 1 (Gudang)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="size-2 rounded-full bg-amber-500" /> Toko 2 (Cabang)
                  </span>
                </div>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorT1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorT2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717a22" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: '#a1a1aa' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#a1a1aa' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        color: '#f4f4f5',
                        borderRadius: '12px',
                        border: '1px solid rgba(63, 63, 70, 0.4)',
                        fontSize: '11px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="toko1"
                      name="Toko 1"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorT1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="toko2"
                      name="Toko 2"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorT2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feed Transaksi Live */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                    Feed Transaksi Terakhir
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Live order feed kasir &amp; web store
                  </p>
                </div>
                <Link
                  to="/online-orders"
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Semua Order &rarr;
                </Link>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                {recentOrders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-zinc-400 font-bold">{ord.id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                          POS: {ord.outletId === 'toko-1' ? 'Toko 1' : 'Toko 2'}
                        </span>
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block truncate mt-0.5">
                        {ord.items.map((i: any) => `${i.productName} (${i.qty})`).join(', ')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs font-mono tabular-nums block">
                        Rp {ord.totalAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-medium">{ord.paymentMethod}</span>
                    </div>
                  </div>
                ))}

                {recentOnlineOrders?.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {ord.id}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                          WEB: {ord.customerName}
                        </span>
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block truncate mt-0.5">
                        {ord.items.map((i: any) => `${i.productName} (${i.qty})`).join(', ')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs font-mono tabular-nums block">
                        Rp {ord.totalAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-indigo-500 font-medium">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
