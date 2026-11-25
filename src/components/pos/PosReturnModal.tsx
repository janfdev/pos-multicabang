import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { OutletId } from '@/lib/outletStore';
import { playBeep } from '@/lib/audio';

interface PosOrderItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface PosOrderRecord {
  id: string;
  outletId: string;
  outletName: string;
  status?: 'COMPLETED' | 'VOIDED';
  totalAmount: number;
  paymentMethod: string;
  cashReceived?: number;
  cashChange?: number;
  items: PosOrderItem[];
  createdAt: string;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
}

interface PosReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOutlet: OutletId;
  cashierName: string;
  onStockRestored: () => void;
  onPrintReceipt: (order: PosOrderRecord) => void;
}

const QUICK_REASONS = [
  'Salah Input Kasir',
  'Kemasan Rusak / Bocor',
  'Pelanggan Batal Membeli',
  'Salah Nominal / Item',
];

export function PosReturnModal({
  isOpen,
  onClose,
  activeOutlet,
  cashierName,
  onStockRestored,
  onPrintReceipt,
}: PosReturnModalProps) {
  const [orders, setOrders] = useState<PosOrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVoidId, setSelectedVoidId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/orders?outletId=${activeOutlet}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setSelectedVoidId(null);
      setVoidReason('');
      loadOrders();
    }
  }, [isOpen, activeOutlet]);

  const handleConfirmVoid = async (orderId: string) => {
    if (!voidReason.trim()) {
      setFeedback({ type: 'error', text: 'Alasan pembatalan/retur wajib diisi untuk jejak audit.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/pos/orders/${orderId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: voidReason.trim(),
          voidedBy: cashierName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1100, 0.12);
        setFeedback({ type: 'success', text: data.message || 'Transaksi berhasil diretur dan stok dikembalikan.' });
        setSelectedVoidId(null);
        setVoidReason('');
        await loadOrders();
        onStockRestored();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Gagal memproses retur transaksi.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan jaringan saat memproses retur.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.items?.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center">
                  <Receipt className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                    Riwayat Transaksi &amp; Retur POS (F-13)
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Cetak ulang struk atau batalkan/retur transaksi dengan pengembalian stok atomik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 bg-gray-50/70 dark:bg-neutral-800/40 border-b border-gray-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="size-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nomor struk (TRX-...) atau nama barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {loading ? (
                <div className="py-10 text-center text-xs text-gray-400">Memuat riwayat transaksi POS...</div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  Belum ada transaksi POS tercatat di cabang ini.
                </div>
              ) : (
                filtered.map((order) => {
                  const isVoided = order.status === 'VOIDED';
                  const isConfirming = selectedVoidId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                        isVoided
                          ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200/70 dark:border-rose-900/50'
                          : 'bg-white dark:bg-neutral-900 border-gray-200/80 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-extrabold text-gray-900 dark:text-neutral-50">
                              {order.id}
                            </span>
                            {isVoided ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                                <Ban className="size-2.5" />
                                DIRETUR / VOID
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                SELESAI
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <span
                          className={`font-mono text-sm font-extrabold ${
                            isVoided
                              ? 'line-through text-rose-600 dark:text-rose-400'
                              : 'text-gray-900 dark:text-neutral-50'
                          }`}
                        >
                          {formatRupiah(order.totalAmount)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl p-2.5 space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-700 dark:text-neutral-300">
                              {it.qty}x {it.productName}
                            </span>
                            <span className="font-mono font-semibold text-gray-900 dark:text-neutral-100">
                              {formatRupiah(it.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Void Audit Box */}
                      {isVoided ? (
                        <div className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/50 text-[11px] text-rose-800 dark:text-rose-300 space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <ShieldAlert className="size-3.5" />
                            <span>Jejak Audit Retur / Void</span>
                          </div>
                          <p>Alasan: {order.voidReason}</p>
                          <p className="text-[10px] opacity-80">
                            Diproses oleh {order.voidedBy} pada{' '}
                            {order.voidedAt ? new Date(order.voidedAt).toLocaleString('id-ID') : '-'}
                          </p>
                        </div>
                      ) : isConfirming ? (
                        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                          <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="size-3.5" />
                            <span>Konfirmasi Void / Retur &amp; Pengembalian Stok</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_REASONS.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setVoidReason(r)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  voidReason === r
                                    ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-gray-900'
                                    : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Tulis alasan pembatalan / retur (wajib diisi)..."
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVoidId(null);
                                setVoidReason('');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleConfirmVoid(order.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>{submitting ? 'Memproses...' : 'Konfirmasi Retur & Kembalikan Stok'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => onPrintReceipt(order)}
                            className="flex-1 py-1.5 px-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="size-3.5" />
                            <span>Cetak Ulang Struk</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVoidId(order.id);
                              setVoidReason('');
                              setFeedback(null);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="size-3.5" />
                            <span>Void / Retur Barang</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
