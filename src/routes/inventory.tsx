import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { PackageSearch, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/inventory')({
  component: InventoryPage,
});

function InventoryPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/inventory/monitoring')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-stone-900">Monitoring Stok Antar-Cabang</h2>
        <p className="text-xs text-stone-500">
          Perbandingan stok real-time antara Gudang Toko 1 (Pusat) dan Toko 2 (Cabang)
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] text-stone-500 font-bold uppercase">
              <tr>
                <th className="p-3.5 px-4">Kode & Nama Barang</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5 text-center">Stok Toko 1 (Gudang)</th>
                <th className="p-3.5 text-center">Stok Toko 2 (Cabang)</th>
                <th className="p-3.5 text-center">Status Cabang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((row) => (
                <tr key={row.product.id} className="hover:bg-stone-50/50">
                  <td className="p-3.5 px-4">
                    <span className="font-mono text-[10px] text-stone-400 block">{row.product.sku}</span>
                    <strong className="font-bold text-stone-800 text-xs">{row.product.name}</strong>
                  </td>
                  <td className="p-3.5 text-stone-500">{row.product.category}</td>
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="size-3 text-amber-600" />
                        <span>Minta Tambah</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>Aman</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
