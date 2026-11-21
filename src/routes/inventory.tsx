import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  PackageSearch,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Filter,
  Boxes,
  Building2,
  Store,
  Layers,
  Send,
  Package,
  ClipboardCheck,
} from 'lucide-react';
import { outletStore, OutletId, OUTLET_CONFIG } from '@/lib/outletStore';
import { authStore } from '@/lib/authStore';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockOpnameModal } from '@/components/inventory/StockOpnameModal';

export const Route = createFileRoute('/inventory')({
  component: InventoryPage,
});

type InventoryViewScope = 'ACTIVE_STORE' | 'TOKO_1' | 'TOKO_2' | 'MATRIX';

function InventoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());
  const currentUser = authStore.getUser();

  // Initial view scope: default to ACTIVE_STORE or the user's assigned store
  const [scope, setScope] = useState<InventoryViewScope>(() => {
    if (currentUser?.outletId === 'toko-1') return 'TOKO_1';
    if (currentUser?.outletId === 'toko-2') return 'TOKO_2';
    if (currentUser?.outletId === 'ALL') return 'MATRIX';
    return 'ACTIVE_STORE';
  });

  useEffect(() => {
    const unsubOutlet = outletStore.subscribe((id) => setActiveOutlet(id));
    return unsubOutlet;
  }, []);

  useEffect(() => {
    fetch('/api/inventory/monitoring')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        row.product.name.toLowerCase().includes(search.toLowerCase()) ||
        row.product.sku.toLowerCase().includes(search.toLowerCase()) ||
        row.product.category.toLowerCase().includes(search.toLowerCase());

      // If viewing Toko 2 or active store is Toko 2, low stock means isToko2Low
      const isTargetLow = scope === 'TOKO_1' ? row.isToko1Low : row.isToko2Low;
      const matchAlert = onlyLowStock ? isTargetLow : true;
      return matchSearch && matchAlert;
    });
  }, [data, search, onlyLowStock, scope]);

  const targetOutletId: OutletId =
    scope === 'TOKO_1' ? 'toko-1' : scope === 'TOKO_2' ? 'toko-2' : activeOutlet;
  const targetOutletInfo = OUTLET_CONFIG[targetOutletId];

  const lowStockCountToko2 = data.filter((d) => d.isToko2Low).length;
  const totalSkuCount = data.length;

  return (
    <DashboardLayout title="Manajemen Stok & Inventaris">
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                targetOutletId === 'toko-1'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Boxes className="size-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Data Stok &amp; Inventaris — {scope === 'MATRIX' ? 'Semua Cabang (Matriks)' : targetOutletInfo.name}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {scope === 'TOKO_1' && 'Data stok fisik yang berada di Gudang Toko 1 (Pusat & Distribusi)'}
            {scope === 'TOKO_2' && 'Data stok fisik yang berada di rak display Toko 2 (Cabang Satelit)'}
            {scope === 'ACTIVE_STORE' && `Data stok yang disinkronkan khusus untuk toko aktif Anda (${targetOutletInfo.shortName})`}
            {scope === 'MATRIX' && 'Perbandingan langsung ketersediaan stok antara Toko 1 (Gudang) dan Toko 2 (Cabang)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpnameModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <ClipboardCheck className="size-3.5" />
            <span>Stock Opname</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalSkuCount}</span> Total SKU
          </span>

          {lowStockCountToko2 > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lowStockCountToko2} Menipis di Toko 2</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Scope Selector */}
        <div className="overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold w-fit shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setScope('ACTIVE_STORE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                scope === 'ACTIVE_STORE'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Store className="size-3.5" />
              <span>Toko Aktif ({targetOutletInfo.shortName})</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('TOKO_1')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                scope === 'TOKO_1'
                  ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Hanya Toko 1 (Gudang)</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('TOKO_2')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                scope === 'TOKO_2'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Store className="size-3.5" />
              <span>Hanya Toko 2 (Cabang)</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('MATRIX')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                scope === 'MATRIX'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Matriks Lengkap (T1 &amp; T2)</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SKU, nama produk, kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              onlyLowStock
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-xs'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Filter className="size-3.5" />
            <span>Stok Kritis Saja</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 px-4">Kode &amp; Nama Barang</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Jual</th>

                {/* Scope-dependent column headers */}
                {scope === 'TOKO_1' ? (
                  <>
                    <th className="p-3.5 text-center">Stok Toko 1 (Gudang)</th>
                    <th className="p-3.5 text-center">Status Gudang Pusat</th>
                    <th className="p-3.5 text-center">Stok Cabang T2</th>
                    <th className="p-3.5 text-right px-4">Tindakan Logistik</th>
                  </>
                ) : scope === 'TOKO_2' ? (
                  <>
                    <th className="p-3.5 text-center">Stok Toko 2 (Cabang)</th>
                    <th className="p-3.5 text-center">Batas Minimum</th>
                    <th className="p-3.5 text-center">Kesiapan Stok Cabang</th>
                    <th className="p-3.5 text-center">Stok di Pusat</th>
                    <th className="p-3.5 text-right px-4">Aksi Pasokan</th>
                  </>
                ) : scope === 'ACTIVE_STORE' ? (
                  <>
                    <th className="p-3.5 text-center">
                      Stok Fisik {targetOutletInfo.shortName}
                    </th>
                    <th className="p-3.5 text-center">Batas Minimum</th>
                    <th className="p-3.5 text-center">Status Ketersediaan</th>
                    <th className="p-3.5 text-right px-4">Aksi</th>
                  </>
                ) : (
                  <>
                    <th className="p-3.5 text-center">Stok Toko 1 (Gudang)</th>
                    <th className="p-3.5 text-center">Stok Toko 2 (Cabang)</th>
                    <th className="p-3.5 text-center">Status Toko 2</th>
                    <th className="p-3.5 text-right px-4">Aksi Suplai</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Tidak ada barang yang cocok dengan kriteria filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const isT2Low = row.isToko2Low;
                  const isCurrentToko1 = targetOutletId === 'toko-1';
                  const activeStock = isCurrentToko1 ? row.toko1Stock : row.toko2Stock;
                  const isCurrentLow = isCurrentToko1 ? row.isToko1Low : row.isToko2Low;

                  return (
                    <tr
                      key={row.product.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3.5 px-4">
                        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 block">
                          {row.product.sku}
                        </span>
                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs block">
                          {row.product.name}
                        </strong>
                      </td>
                      <td className="p-3.5 text-zinc-500 dark:text-zinc-400 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                          {row.product.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        Rp {row.product.sellingPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Scope-dependent columns */}
                      {scope === 'TOKO_1' ? (
                        <>
                          <td className="p-3.5 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono font-bold tabular-nums">
                              {row.toko1Stock} {row.product.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="size-3" />
                              <span>Gudang Siap</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-zinc-500">
                            {row.toko2Stock} {row.product.unit}
                            {isT2Low && (
                              <span className="block text-[9px] text-amber-600 font-bold">Minta Tambah</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right px-4">
                            <Link
                              to="/transfers"
                              search={{ requestProductId: row.product.id } as any}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                            >
                              <span>Kirim ke T2</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </>
                      ) : scope === 'TOKO_2' ? (
                        <>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold tabular-nums ${
                                isT2Low
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {row.toko2Stock} {row.product.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-zinc-400">
                            {row.minAlertQty} {row.product.unit}
                          </td>
                          <td className="p-3.5 text-center">
                            {isT2Low ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="size-3" />
                                <span>Menipis</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="size-3" />
                                <span>Aman</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-mono text-zinc-500">
                            {row.toko1Stock} {row.product.unit}
                          </td>
                          <td className="p-3.5 text-right px-4">
                            <Link
                              to="/transfers"
                              search={{ requestProductId: row.product.id } as any}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                isT2Low
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                              }`}
                            >
                              <span>Minta Tambah</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </>
                      ) : scope === 'ACTIVE_STORE' ? (
                        <>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold tabular-nums ${
                                isCurrentLow
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              {activeStock} {row.product.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-zinc-400">
                            {row.minAlertQty} {row.product.unit}
                          </td>
                          <td className="p-3.5 text-center">
                            {isCurrentLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="size-3" />
                                <span>Perlu Restock</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="size-3" />
                                <span>Stok Tersedia</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right px-4">
                            <Link
                              to="/transfers"
                              search={{ requestProductId: row.product.id } as any}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors"
                            >
                              <span>Mutasi</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3.5 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-bold tabular-nums">
                              {row.toko1Stock} {row.product.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold tabular-nums ${
                                isT2Low
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {row.toko2Stock} {row.product.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {isT2Low ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                                <span>Minta Tambah</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Aman</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right px-4">
                            <Link
                              to="/transfers"
                              search={{ requestProductId: row.product.id } as any}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isT2Low
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <span>Minta Suplai</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Stock Opname Modal */}
      <StockOpnameModal
        isOpen={isOpnameModalOpen}
        onClose={() => setIsOpnameModalOpen(false)}
        products={data}
        activeOutletId={targetOutletId === 'toko-1' ? 'toko-1' : 'toko-2'}
        onOpnameSuccess={() => {
          fetch('/api/inventory/monitoring')
            .then((res) => res.json())
            .then((d) => setData(d))
            .catch(() => {});
        }}
      />
    </DashboardLayout>
  );
}
