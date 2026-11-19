import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Send,
  CheckCircle2,
  Plus,
  Building2,
  X,
  AlertTriangle,
  Truck,
  RotateCcw,
  Clock,
  UserCheck,
} from 'lucide-react';

export const Route = createFileRoute('/transfers')({
  component: TransfersPage,
});

interface TransferItem {
  productId: string;
  productName: string;
  qtyRequested: number;
  qtyDispatched: number;
  qtyReceived: number;
}

interface TransferRecord {
  id: string;
  fromOutletId: string;
  toOutletId: string;
  type?: 'RESTOCK' | 'RETURN' | 'REBALANCE';
  status: 'REQUESTED' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  courierName?: string | null;
  dispatchedBy?: string | null;
  receivedBy?: string | null;
  notes: string;
  items: TransferItem[];
  requestedAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const [fromOutletId, setFromOutletId] = useState<string>('toko-1');
  const [toOutletId, setToOutletId] = useState<string>('toko-2');
  const [transferType, setTransferType] = useState<'RESTOCK' | 'RETURN' | 'REBALANCE'>('RESTOCK');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [requestQty, setRequestQty] = useState<number>(10);
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dispatch Courier Modal State
  const [dispatchModalTransfer, setDispatchModalTransfer] = useState<TransferRecord | null>(null);
  const [courierNameInput, setCourierNameInput] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = () => {
    fetch('/api/transfers')
      .then((res) => res.json())
      .then((data) => setTransfers(data))
      .catch(() => {});

    fetch('/api/inventory/monitoring')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preselect = params.get('requestProductId');
      if (preselect) {
        setSelectedProductId(preselect);
        setIsModalOpen(true);
      }
    }
  }, []);

  const handleOpenDispatchModal = (transfer: TransferRecord) => {
    setDispatchModalTransfer(transfer);
    setCourierNameInput('Kurir Internal Toko');
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalTransfer) return;
    setIsDispatching(true);

    try {
      const res = await fetch(`/api/transfers/${dispatchModalTransfer.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courierName: courierNameInput.trim() || 'Kurir Internal',
        }),
      });

      if (res.ok) {
        setDispatchModalTransfer(null);
        loadData();
      }
    } catch {
      // network error
    } finally {
      setIsDispatching(false);
    }
  };

  const handleReceive = async (id: string) => {
    await fetch(`/api/transfers/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receivedBy: 'Staf Penerima Outlet',
      }),
    });
    loadData();
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setFormError('Pilih produk yang ingin dimutasi.');
      return;
    }
    if (requestQty <= 0) {
      setFormError('Jumlah permintaan minimal 1 unit.');
      return;
    }

    const selectedItem = products.find((p) => p.product.id === selectedProductId);
    if (!selectedItem) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/transfers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromOutletId,
          toOutletId,
          type: transferType,
          notes: requestNotes.trim() || `${transferType === 'RESTOCK' ? 'Permintaan restock' : 'Retur/Relokasi'} ${selectedItem.product.name}`,
          items: [
            {
              productId: selectedItem.product.id,
              productName: selectedItem.product.name,
              qtyRequested: Number(requestQty),
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setSelectedProductId('');
        setRequestQty(10);
        setRequestNotes('');
        loadData();
      } else {
        setFormError(data.error || 'Gagal mengajukan permintaan transfer.');
      }
    } catch {
      setFormError('Gangguan jaringan saat menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const selectedProductData = products.find((p) => p.product.id === selectedProductId);

  const getOutletName = (id: string) => {
    if (id === 'toko-1') return 'Toko 1 (Pusat & Gudang)';
    if (id === 'toko-2') return 'Toko 2 (Cabang Satelit)';
    return id;
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">Mutasi &amp; Transfer Stok Dua Arah</h2>
          <p className="text-xs text-stone-500">
            Protokol distribusi 3 tahap (Toko 1 &harr; Toko 2): Permintaan &rarr; Pengiriman Berkurir &rarr; Konfirmasi Diterima
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Buat Mutasi / Retur Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto scrollbar-none max-w-full py-0.5">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-xl text-xs w-fit shrink-0">
          {[
            { label: 'Semua Status', value: 'ALL' },
            { label: 'Menunggu Pengiriman', value: 'REQUESTED' },
            { label: 'Dalam Perjalanan', value: 'DISPATCHED' },
            { label: 'Selesai Diterima', value: 'RECEIVED' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer List */}
      <div className="space-y-3">
        {filteredTransfers.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white border border-stone-200 rounded-2xl">
            Tidak ada dokumen mutasi transfer stok dengan filter yang dipilih.
          </div>
        ) : (
          filteredTransfers.map((t) => {
            const isReverse = t.fromOutletId === 'toko-2';
            const typeLabel = t.type === 'RETURN' ? 'Retur Barang' : t.type === 'REBALANCE' ? 'Relokasi Stok' : 'Restock Pasokan';

            return (
              <div key={t.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-stone-900">{t.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isReverse ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {typeLabel}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(t.requestedAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-stone-800 mt-1 flex items-center gap-1.5 flex-wrap">
                      <Building2 className="size-3.5 text-stone-500" />
                      <span className="text-stone-900">{getOutletName(t.fromOutletId)}</span>
                      <span className="text-stone-400">&rarr;</span>
                      <Building2 className="size-3.5 text-stone-500" />
                      <span className="text-stone-900">{getOutletName(t.toOutletId)}</span>
                    </h4>

                    <p className="text-[11px] text-stone-500 mt-0.5">{t.notes}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start ${
                      t.status === 'REQUESTED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : t.status === 'DISPATCHED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {t.status === 'REQUESTED'
                      ? 'Tahap 1: Menunggu Pengiriman'
                      : t.status === 'DISPATCHED'
                      ? 'Tahap 2: Dalam Pengiriman (In-Transit)'
                      : 'Tahap 3: Selesai Diverifikasi'}
                  </span>
                </div>

                {/* Visual Timeline Tracking */}
                <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/60 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative">
                    {/* Stage 1 */}
                    <div className="flex items-start gap-2">
                      <div className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-[11px] text-stone-800 block">Permintaan Diajukan</span>
                        <span className="text-[10px] text-stone-500 block font-mono">
                          {new Date(t.requestedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex items-start gap-2">
                      <div
                        className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          t.dispatchedAt ? 'bg-blue-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        2
                      </div>
                      <div>
                        <span className="font-bold text-[11px] text-stone-800 flex items-center gap-1">
                          <Truck className="size-3 text-stone-500" />
                          <span>{t.dispatchedAt ? 'Dikirim via Kurir' : 'Menunggu Kirim'}</span>
                        </span>
                        {t.courierName && (
                          <span className="text-[10px] text-blue-700 font-semibold block">
                            Kurir: {t.courierName}
                          </span>
                        )}
                        {t.dispatchedAt && (
                          <span className="text-[10px] text-stone-400 font-mono block">
                            {new Date(t.dispatchedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex items-start gap-2">
                      <div
                        className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          t.receivedAt ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        3
                      </div>
                      <div>
                        <span className="font-bold text-[11px] text-stone-800 flex items-center gap-1">
                          <UserCheck className="size-3 text-stone-500" />
                          <span>{t.receivedAt ? 'Diterima & Selesai' : 'Menunggu Penerimaan'}</span>
                        </span>
                        {t.receivedBy && (
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Oleh: {t.receivedBy}
                          </span>
                        )}
                        {t.receivedAt && (
                          <span className="text-[10px] text-stone-400 font-mono block">
                            {new Date(t.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Items Details */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-xs border border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Rincian Barang yang Dimutasi:
                  </span>
                  <div className="space-y-1.5">
                    {t.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">{item.productName}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-stone-500">
                            Diminta: <strong className="text-stone-800 font-black">{item.qtyRequested}</strong>
                          </span>
                          {item.qtyDispatched > 0 && (
                            <span className="text-blue-700">
                              Dikirim: <strong className="font-black">{item.qtyDispatched}</strong>
                            </span>
                          )}
                          {item.qtyReceived > 0 && (
                            <span className="text-emerald-700">
                              Diterima: <strong className="font-black">{item.qtyReceived}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons based on Role/Step */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
                  <span className="text-[11px] text-stone-500">
                    {t.status === 'REQUESTED' && `Menunggu pengemasan & kirim dari ${getOutletName(t.fromOutletId)}`}
                    {t.status === 'DISPATCHED' && `Barang sedang dibawa kurir menuju ${getOutletName(t.toOutletId)}`}
                    {t.status === 'RECEIVED' && `Stok resmi dibukukan di ${getOutletName(t.toOutletId)}`}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {t.status === 'REQUESTED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenDispatchModal(t)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Send className="size-3.5" />
                        <span>Kirim Barang &amp; Input Kurir</span>
                      </button>
                    )}

                    {t.status === 'DISPATCHED' && (
                      <button
                        type="button"
                        onClick={() => handleReceive(t.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Konfirmasi Terima Barang</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Modal (Input Courier Name) */}
      {dispatchModalTransfer && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Truck className="size-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Kirim Barang (Dispatch)</h3>
                  <p className="text-[11px] text-stone-500">Mutasi ID: {dispatchModalTransfer.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDispatchModalTransfer(null)}
                className="size-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-700 border border-stone-100">
                <span className="block text-[11px] text-stone-400">Rute Pengiriman:</span>
                <span className="font-bold text-stone-900 block mt-0.5">
                  {getOutletName(dispatchModalTransfer.fromOutletId)} &rarr; {getOutletName(dispatchModalTransfer.toOutletId)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Nama Kurir / Petugas Ekspedisi *</label>
                <input
                  type="text"
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  placeholder="Contoh: Budi (Kurir Internal) atau GrabExpress"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <p className="text-[11px] text-stone-500">
                Stok pada outlet pengirim akan langsung dipotong setelah Anda menekan tombol di bawah.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDispatchModalTransfer(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={isDispatching}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isDispatching ? 'Memproses...' : 'Kirim Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Permintaan Mutasi Stok Dua Arah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ArrowLeftRight className="size-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Form Mutasi &amp; Retur Stok</h3>
                  <p className="text-[11px] text-stone-500">Mendukung alur Toko 1 &harr; Toko 2</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              {/* Pilihan Arah Mutasi */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">Cabang Asal (Pengirim) *</label>
                  <select
                    value={fromOutletId}
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setFromOutletId(newFrom);
                      setToOutletId(newFrom === 'toko-1' ? 'toko-2' : 'toko-1');
                      setTransferType(newFrom === 'toko-1' ? 'RESTOCK' : 'RETURN');
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="toko-1">Toko 1 (Pusat &amp; Gudang)</option>
                    <option value="toko-2">Toko 2 (Cabang Satelit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">Cabang Tujuan (Penerima) *</label>
                  <select
                    value={toOutletId}
                    onChange={(e) => {
                      const newTo = e.target.value;
                      setToOutletId(newTo);
                      setFromOutletId(newTo === 'toko-1' ? 'toko-2' : 'toko-1');
                      setTransferType(newTo === 'toko-2' ? 'RESTOCK' : 'RETURN');
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="toko-2">Toko 2 (Cabang Satelit)</option>
                    <option value="toko-1">Toko 1 (Pusat &amp; Gudang)</option>
                  </select>
                </div>
              </div>

              {/* Tipe Mutasi */}
              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Tipe / Kategori Mutasi *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'RESTOCK', label: 'Restock Pasokan' },
                    { id: 'RETURN', label: 'Retur Cacat/Exp' },
                    { id: 'REBALANCE', label: 'Relokasi Stok' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTransferType(t.id as any)}
                      className={`p-2 rounded-xl text-center font-bold text-[11px] border transition-colors cursor-pointer ${
                        transferType === t.id
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Pilih Barang yang Dimutasi *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                >
                  <option value="">-- Pilih Barang dari Master Katalog --</option>
                  {products.map((row) => (
                    <option key={row.product.id} value={row.product.id}>
                      {row.product.name} ({row.product.sku}) — Stok T1: {row.toko1Stock} | Stok T2: {row.toko2Stock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Stock Comparison Card */}
              {selectedProductData && (
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Stok Toko 1 (Pusat):</span>
                    <span className="font-mono font-black text-sm text-stone-900 block tabular-nums">
                      {selectedProductData.toko1Stock} {selectedProductData.product.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Stok Toko 2 (Cabang):</span>
                    <span
                      className={`font-mono font-black text-sm block tabular-nums ${
                        selectedProductData.isToko2Low ? 'text-amber-800' : 'text-emerald-800'
                      }`}
                    >
                      {selectedProductData.toko2Stock} {selectedProductData.product.unit}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Jumlah yang Dimutasi (Pcs / Unit) *</label>
                <input
                  type="number"
                  min="1"
                  value={requestQty}
                  onChange={(e) => setRequestQty(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Catatan / Alasan Mutasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Retur kemasan penyok / Restock akhir pekan"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim Data...' : 'Ajukan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
