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
      <div className="p-12 text-center text-stone-400 text-xs bg-white rounded-2xl border border-stone-200">
        Memuat data analitik multi-cabang...
      </div>
    );
  }

  const { kpis, salesTrend, recentOrders, recentOnlineOrders } = data;

  return (
    <div className="space-y-6">
      {/* View Switcher: Operational vs BagUI Modern Store */}
      <div className="flex items-center gap-2 p-1 bg-stone-200/80 rounded-xl w-fit text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveView('OPERATIONAL')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeView === 'OPERATIONAL'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Ringkasan Multi-Cabang (Live)
        </button>
        <button
          type="button"
          onClick={() => setActiveView('BAGUI')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeView === 'BAGUI'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Modern Store Dashboard (BagUI)</span>
          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-mono">
            New
          </span>
        </button>
      </div>

      {activeView === 'BAGUI' ? (
        <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white">
          <DashboardStore />
        </div>
      ) : (
        <>
          {/* Module Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Ringkasan Eksekutif &amp; Operasional Cabang
            </h2>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
              Omnichannel Multi-Outlet
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Monitoring performa omzet offline &amp; online serta pergerakan stok Toko 1 (Gudang) &amp; Toko 2 (Cabang)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/shop"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="size-3.5" />
            <span>Katalog Online (/shop)</span>
            <ExternalLink className="size-3" />
          </Link>
          <Link
            to="/online-orders"
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-3.5" />
            <span>Order Online</span>
            {kpis.pendingOnlineOrdersCount > 0 && (
              <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                {kpis.pendingOnlineOrdersCount}
              </span>
            )}
          </Link>
          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingCart className="size-3.5" />
            <span>Buka Kasir POS</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Omzet Hari Ini */}
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-600">Total Omzet Hari Ini</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              Rp {kpis.todayRevenue.toLocaleString('id-ID')}
            </span>
            <div className="text-[10px] text-stone-500 font-medium flex items-center gap-2 mt-1">
              <span className="text-emerald-700 font-bold">
                Kasir: Rp {kpis.posRevenue.toLocaleString('id-ID')}
              </span>
              <span>&bull;</span>
              <span className="text-blue-700 font-bold">
                Online: Rp {kpis.onlineRevenue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Stok Gudang Toko 1 */}
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-600">Stok Toko 1 (Gudang Pusat)</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Store className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              {kpis.totalToko1Stock.toLocaleString('id-ID')} Unit
            </span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              Siap suplai cabang &amp; pesanan online
            </span>
          </div>
        </div>

        {/* KPI 3: Stok Etalase Toko 2 */}
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-600">Stok Toko 2 (Cabang Satelit)</span>
            <div className="size-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              {kpis.totalToko2Stock.toLocaleString('id-ID')} Unit
            </span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              Stok siap jual di kasir cabang
            </span>
          </div>
        </div>

        {/* KPI 4: Alert Stok & Online Orders */}
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-600">Pesanan &amp; Logistik Kritis</span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-amber-800 tabular-nums">
                {kpis.lowStockToko2Count} SKU
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-xs font-black text-blue-800">
                {kpis.pendingOnlineOrdersCount} Order Web
              </span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-0.5">
              {kpis.pendingTransfersCount} transfer stok menunggu kirim
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Live Order Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trend Omzet Mingguan (Recharts AreaChart) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-emerald-700" />
                <span>Tren Penjualan 7 Hari Terakhir</span>
              </h3>
              <p className="text-[11px] text-stone-500">Perbandingan omzet harian Toko 1 (Gudang) vs Toko 2 (Cabang)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="size-2 rounded-full bg-emerald-600" /> Toko 1 (Gudang)
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <span className="size-2 rounded-full bg-amber-500" /> Toko 2 (Cabang)
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorT1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorT2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="toko1" name="Toko 1" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorT1)" />
                <Area type="monotone" dataKey="toko2" name="Toko 2" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorT2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feeds: Kasir & Online */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs text-stone-900">Feed Transaksi Terakhir</h3>
              <p className="text-[11px] text-stone-500">Live feed kasir fisik &amp; pesanan online</p>
            </div>
            <Link to="/online-orders" className="text-[10px] font-bold text-emerald-700 hover:underline">
              Semua Order &rarr;
            </Link>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
            {recentOrders.map((ord: any) => (
              <div key={ord.id} className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-stone-400 font-bold">{ord.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-200 text-stone-700">
                      POS: {ord.outletId === 'toko-1' ? 'Toko 1' : 'Toko 2'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-800 text-[11px] block truncate mt-0.5">
                    {ord.items.map((i: any) => `${i.productName} (${i.qty})`).join(', ')}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-emerald-700 text-xs tabular-nums block">
                    Rp {ord.totalAmount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium">{ord.paymentMethod}</span>
                </div>
              </div>
            ))}

            {recentOnlineOrders?.map((ord: any) => (
              <div key={ord.id} className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-blue-600 font-bold">{ord.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      ONLINE: {ord.customerName}
                    </span>
                  </div>
                  <span className="font-bold text-stone-800 text-[11px] block truncate mt-0.5">
                    {ord.items.map((i: any) => `${i.productName} (${i.qty})`).join(', ')}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-blue-700 text-xs tabular-nums block">
                    Rp {ord.totalAmount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-blue-600 font-medium">{ord.status}</span>
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
