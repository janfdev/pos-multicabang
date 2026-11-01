import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  PackageSearch,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Filter,
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

  return (
    <div className="space-y-4">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">Monitoring Stok Antar-Cabang</h2>
          <p className="text-xs text-stone-500">
            Perbandingan stok real-time antara Gudang Toko 1 (Pusat) dan Toko 2 (Cabang)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="size-3.5 text-amber-600" />
              <span>{lowStockCount} SKU Cabang Menipis</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari SKU, nama produk, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            onlyLowStock
              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
              : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
          }`}
        >
          <Filter className="size-3.5" />
          <span>Hanya Stok Menipis (Minta Tambah)</span>
        </button>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 px-4">Kode &amp; Nama Barang</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5 text-center">Stok Toko 1 (Gudang)</th>
                <th className="p-3.5 text-center">Stok Toko 2 (Cabang)</th>
                <th className="p-3.5 text-center">Status Cabang</th>
                <th className="p-3.5 text-right px-4">Aksi Suplai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-stone-400">
                    Tidak ada barang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.product.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-3.5 px-4">
                      <span className="font-mono text-[10px] text-stone-400 block">{row.product.sku}</span>
                      <strong className="font-bold text-stone-800 text-xs block">{row.product.name}</strong>
                    </td>
                    <td className="p-3.5 text-stone-500 font-medium">{row.product.category}</td>
                    <td className="p-3.5 font-bold tabular-nums">
                      Rp {row.product.sellingPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 font-black tabular-nums">
                        {row.toko1Stock} {row.product.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-black tabular-nums ${
                          row.isToko2Low
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {row.toko2Stock} {row.product.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {row.isToko2Low ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="size-3 text-amber-600" />
                          <span>Minta Tambah</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>Aman</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right px-4">
                      <Link
                        to="/transfers"
                        search={{ requestProductId: row.product.id } as any}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          row.isToko2Low
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
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
