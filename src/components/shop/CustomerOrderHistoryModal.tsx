import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Phone,
  Clock,
  MessageCircle,
  RotateCcw,
  Store,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { cartStore } from '@/lib/cartStore';
import { playBeep } from '@/lib/audio';

interface OnlineOrderItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface CustomerOrder {
  id: string;
  outletId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  deliveryAddress: string | null;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  notes?: string;
  items: OnlineOrderItem[];
  createdAt: string;
}

interface CustomerOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorderComplete: () => void;
  formatRupiah: (val: number) => string;
}

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  PENDING: {
    label: 'Menunggu Konfirmasi',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  PROCESSING: {
    label: 'Sedang Diproses',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
  READY: {
    label: 'Siap Diambil / Dikirim',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
  },
  COMPLETED: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
  },
};

export function CustomerOrderHistoryModal({
  isOpen,
  onClose,
  onReorderComplete,
  formatRupiah,
}: CustomerOrderHistoryModalProps) {
  const [phoneQuery, setPhoneQuery] = useState('');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [reorderLoadingId, setReorderLoadingId] = useState<string | null>(null);
  const [reorderWarnings, setReorderWarnings] = useState<string[]>([]);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReorderWarnings([]);
      setReorderSuccessMsg(null);
      try {
        const savedPhone = localStorage.getItem('pos_last_customer_phone') || '';
        if (savedPhone && !phoneQuery) {
          setPhoneQuery(savedPhone);
          fetchOrdersByPhone(savedPhone);
        }
      } catch {}
    }
  }, [isOpen]);

  const fetchOrdersByPhone = async (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) return;
    setLoading(true);
    setFetchError(null);
    setSearched(true);
    setReorderWarnings([]);
    setReorderSuccessMsg(null);
    try {
      const res = await fetch(`/api/online-orders?phone=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
      setFetchError('Gagal terhubung ke server untuk memuat riwayat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrdersByPhone(phoneQuery);
  };

  const handleReorder = async (order: CustomerOrder) => {
    setReorderLoadingId(order.id);
    setReorderWarnings([]);
    setReorderSuccessMsg(null);
    try {
      const res = await fetch(`/api/online-orders/${order.id}/reorder`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReorderWarnings([data.error || 'Gagal memvalidasi ulang pesanan.']);
        return;
      }

      const availableItems = (data.items || []).filter((it: any) => !it.outOfStock && it.adjustedQty > 0);
      if (availableItems.length === 0) {
        setReorderWarnings(
          data.warnings?.length
            ? data.warnings
            : ['Seluruh produk dalam pesanan ini sedang habis stoknya.']
        );
        return;
      }

      cartStore.clearCart();
      for (const it of availableItems) {
        for (let i = 0; i < it.adjustedQty; i++) {
          cartStore.addItem({
            productId: it.productId,
            name: it.productName,
            sellingPrice: it.currentUnitPrice,
            unit: it.unit || 'PCS',
            stock: it.availableQty,
            image: it.image || '',
            outletId: it.outletId,
            outletName: it.outletName,
          });
        }
      }

      playBeep(1300, 0.1);
      if (data.warnings?.length) {
        setReorderWarnings(data.warnings);
        setReorderSuccessMsg(`${availableItems.length} produk berhasil dimasukkan ke keranjang dengan penyesuaian stok/harga.`);
      } else {
        onClose();
        onReorderComplete();
      }
    } catch {
      setReorderWarnings(['Terjadi kesalahan jaringan saat memvalidasi stok ulang.']);
    } finally {
      setReorderLoadingId(null);
    }
  };

  const buildWhatsAppFollowUp = (order: CustomerOrder) => {
    const storePhone = order.outletId === 'toko-1' ? '6281122334455' : '6281234567890';
    const outletName = order.outletId === 'toko-1' ? 'Toko 1 (Pusat & Gudang)' : 'Toko 2 (Cabang Satelit)';
    const statusLabel = STATUS_META[order.status]?.label || order.status;
    const msg =
      `Halo Admin ${outletName}, saya ingin menanyakan status pesanan saya:\n\n` +
      `No. Pesanan: *${order.id}*\n` +
      `Nama: ${order.customerName}\n` +
      `Status Terakhir: *${statusLabel}*\n` +
      `Total: *${formatRupiah(order.totalAmount)}*\n\n` +
      `Terima kasih.`;
    return `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`;
  };

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
            className="relative z-10 w-full max-w-lg max-h-[85vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center">
                  <ClipboardList className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                    Lacak &amp; Riwayat Pesanan Saya
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Cek status pesanan, chat WhatsApp toko, atau pesan ulang 1-klik
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

            {/* Phone Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="px-5 py-3.5 bg-gray-50/70 dark:bg-neutral-800/40 border-b border-gray-100 dark:border-neutral-800 flex gap-2"
            >
              <div className="relative flex-1">
                <Phone className="size-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="Masukkan nomor WhatsApp Anda (cth: 0812...)"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="size-3.5" />
                <span>{loading ? 'Mencari...' : 'Cari'}</span>
              </button>
            </form>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Reorder Warnings / Feedback */}
              {reorderWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>Catatan Validasi Ulang Stok &amp; Harga:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5">
                    {reorderWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                  {reorderSuccessMsg && (
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {reorderSuccessMsg}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onReorderComplete();
                        }}
                        className="px-3 py-1 rounded-lg bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Buka Keranjang
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!searched ? (
                <div className="py-10 text-center space-y-2">
                  <Clock className="size-8 text-gray-300 dark:text-neutral-700 mx-auto" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
                    Masukkan nomor WhatsApp yang digunakan saat memesan
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500">
                    Coba demo dengan nomor <span className="font-mono font-bold">081234567890</span> atau <span className="font-mono font-bold">081988776655</span>
                  </p>
                </div>
              ) : loading ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  Memuat riwayat pesanan...
                </div>
              ) : fetchError ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center space-y-2.5">
                  <AlertTriangle className="size-6 text-rose-500 mx-auto" />
                  <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">{fetchError}</p>
                  <button
                    type="button"
                    onClick={() => fetchOrdersByPhone(phoneQuery)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <Package className="size-8 text-gray-300 dark:text-neutral-700 mx-auto" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
                    Belum ada pesanan ditemukan untuk nomor tersebut
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500">
                    Pastikan nomor WhatsApp sesuai dengan yang diisikan saat checkout.
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.PENDING;
                  const outletLabel =
                    order.outletId === 'toko-1' ? 'Toko 1 (Pusat & Gudang)' : 'Toko 2 (Cabang Satelit)';
                  return (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-extrabold text-gray-900 dark:text-neutral-50">
                              {order.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Store className="size-3" />
                              {outletLabel}
                            </span>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1">
                              <Truck className="size-3" />
                              {order.fulfillmentType === 'DELIVERY' ? 'Kirim Kurir' : 'Ambil di Toko'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 shrink-0">
                          {new Date(order.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl p-2.5 space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-700 dark:text-neutral-300 truncate pr-2">
                              {it.qty}x {it.productName}
                            </span>
                            <span className="font-mono font-semibold text-gray-900 dark:text-neutral-100 shrink-0">
                              {formatRupiah(it.subtotal)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-1.5 mt-1 border-t border-gray-200/70 dark:border-neutral-700/70 flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-600 dark:text-neutral-400">Total Bayar</span>
                          <span className="font-mono text-gray-900 dark:text-neutral-50">
                            {formatRupiah(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Actions: Chat Ulang & Re-Order */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={buildWhatsAppFollowUp(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="size-3.5" />
                          <span>Chat Ulang WA</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          disabled={reorderLoadingId === order.id}
                          className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="size-3.5" />
                          <span>{reorderLoadingId === order.id ? 'Validasi...' : 'Pesan Lagi'}</span>
                        </button>
                      </div>
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
