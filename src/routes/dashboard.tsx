import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  ShoppingCart,
  Store,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="p-8 text-center text-stone-500 text-xs">
        Memuat data analitik multi-cabang...
      </div>
    );
  }

  const { kpis, salesTrend, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            Ringkasan Eksekutif & Operasional Cabang
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitoring performa omzet kasir dan status distribusi logistik Toko 1 & Toko 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="size-3.5" />
            <span>Buka Kasir POS</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (Adapted from extracted template) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold">Omzet Hari Ini</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              Rp {kpis.todayRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="size-3" />
              <span>{kpis.totalOrdersToday} transaksi kasir tercatat</span>
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold">Stok Toko 1 (Gudang)</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Store className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              {kpis.totalToko1Stock} Unit
            </span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              Siap alokasi suplai cabang
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold">Stok Toko 2 (Cabang)</span>
            <div className="size-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums block">
              {kpis.totalToko2Stock} Unit
            </span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              Stok siap jual etalase
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold">Alert Stok Menipis</span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-amber-800 tabular-nums block">
              {kpis.lowStockToko2Count} Produk
            </span>
            <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
              Di Toko 2 perlu restock segera
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trend Omzet Mingguan (Recharts AreaChart) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs text-stone-900">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-[11px] text-stone-500">Perbandingan omzet harian Toko 1 vs Toko 2</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-600" /> Toko 1
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="size-2 rounded-full bg-amber-500" /> Toko 2
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
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

        {/* Recent Transaksi Feed */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs text-stone-900">Transaksi Kasir Terbaru</h3>
              <p className="text-[11px] text-stone-500">Live order feed multi-cabang</p>
            </div>
            <Link to="/" className="text-[10px] font-bold text-emerald-700 hover:underline">
              Buka POS
            </Link>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
            {recentOrders.map((ord: any) => (
              <div key={ord.id} className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-stone-400">{ord.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-200 text-stone-700">
                      {ord.outletId === 'toko-1' ? 'Toko 1' : 'Toko 2'}
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
          </div>
        </div>
      </div>
    </div>
  );
}
