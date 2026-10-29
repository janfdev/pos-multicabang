import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeftRight, Send, CheckCircle2, Clock } from 'lucide-react';

export const Route = createFileRoute('/transfers')({
  component: TransfersPage,
});

function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);

  const loadTransfers = () => {
    fetch('/api/transfers')
      .then((res) => res.json())
      .then((data) => setTransfers(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleDispatch = async (id: string) => {
    await fetch(`/api/transfers/${id}/dispatch`, { method: 'POST' });
    loadTransfers();
  };

  const handleReceive = async (id: string) => {
    await fetch(`/api/transfers/${id}/receive`, { method: 'POST' });
    loadTransfers();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">Mutasi & Transfer Stok Antar-Cabang</h2>
          <p className="text-xs text-stone-500">
            Alur distribusi 3 tahap: Permintaan Cabang → Pengiriman Gudang Pusat → Verifikasi Fisik Diterima
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {transfers.map((t) => (
          <div key={t.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-stone-400 block">{t.id}</span>
                <h4 className="font-extrabold text-xs text-stone-800">
                  Dari Toko 1 (Gudang) → Ke Toko 2 (Cabang)
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">{t.notes}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  t.status === 'REQUESTED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : t.status === 'DISPATCHED'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {t.status === 'REQUESTED'
                  ? 'Menunggu Pengiriman Toko 1'
                  : t.status === 'DISPATCHED'
                  ? 'Sedang Dikirim (Dalam Perjalanan)'
                  : 'Selesai Diterima Toko 2'}
              </span>
            </div>

            {/* Transfer Items */}
            <div className="p-2.5 bg-stone-50 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Daftar Barang:</span>
              {t.items.map((item: any) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="font-medium text-stone-700">{item.productName}</span>
                  <span className="font-black tabular-nums">{item.qtyRequested} Pcs</span>
                </div>
              ))}
            </div>

            {/* Action Buttons based on Role/Step */}
            <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
              {t.status === 'REQUESTED' && (
                <button
                  type="button"
                  onClick={() => handleDispatch(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="size-3.5" />
                  <span>Kirim Barang dari Toko 1 (Gudang)</span>
                </button>
              )}

              {t.status === 'DISPATCHED' && (
                <button
                  type="button"
                  onClick={() => handleReceive(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Konfirmasi Terima Barang di Toko 2</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
