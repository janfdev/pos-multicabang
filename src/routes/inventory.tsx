import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  PackageSearch,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Filter,
  ArrowDownUp,
  Boxes,
} from 'lucide-react';

export const Route = createFileRoute('/inventory')({
  component: InventoryPage,
});

function InventoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  useEffect(() => {
    fetch('/api/inventory/monitoring')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        row.product.name.toLowerCase().includes(search.toLowerCase()) ||
        row.product.sku.toLowerCase().includes(search.toLowerCase()) ||
        row.product.category.toLowerCase().includes(search.toLowerCase());
      const matchAlert = onlyLowStock ? row.isToko2Low : true;
      return matchSearch && matchAlert;
    });
  }, [data, search, onlyLowStock]);

  const lowStockCount = data.filter((d) => d.isToko2Low).length;
  const totalSkuCount = data.length;

  return (
    <div className="space-y-4">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Boxes className="size-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Monitoring Stok Antar-Cabang
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Matriks ketersediaan stok real-time antara Toko 1 (Gudang Pusat) dan Toko 2 (Cabang Satelit)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalSkuCount}</span> Total SKU
          </span>

          {lowStockCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lowStockCount} Menipis di Cabang</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Semua Stok Aman</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari SKU, nama produk, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            onlyLowStock
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Filter className="size-3.5" />
          <span>Hanya Stok Menipis ({lowStockCount})</span>
        </button>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 px-4">Kode &amp; Nama Barang</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5 text-center">Stok Toko 1 (Gudang)</th>
                <th className="p-3.5 text-center">Stok Toko 2 (Cabang)</th>
                <th className="p-3.5 text-center">Status Pasokan</th>
                <th className="p-3.5 text-right px-4">Aksi Suplai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Tidak ada barang yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
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
                    <td className="p-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-bold tabular-nums">
                        {row.toko1Stock}{' '}
                        <span className="font-sans font-normal text-zinc-400 dark:text-zinc-500 text-[10px]">
                          {row.product.unit}
                        </span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold tabular-nums ${
                          row.isToko2Low
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {row.toko2Stock}{' '}
                        <span className="font-sans font-normal opacity-75 text-[10px]">
                          {row.product.unit}
                        </span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {row.isToko2Low ? (
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
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          row.isToko2Low
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>Minta Suplai</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
