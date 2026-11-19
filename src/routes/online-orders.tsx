import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { outletStore, OutletId } from '@/lib/outletStore';

export const Route = createFileRoute('/online-orders')({
  component: OnlineOrdersPage,
});

interface OnlineOrderItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface OnlineOrder {
  id: string;
  outletId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  deliveryAddress: string | null;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes: string;
  items: OnlineOrderItem[];
  createdAt: string;
  updatedAt: string;
}

function OnlineOrdersPage() {
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [outletScope, setOutletScope] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub = outletStore.subscribe((id) => setActiveOutlet(id));
    return unsub;
  }, []);

  const loadOrders = () => {
    setLoading(true);
    const targetOutletParam = outletScope === 'CURRENT' ? activeOutlet : 'ALL';
    fetch(`/api/online-orders?outletId=${targetOutletParam}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [activeOutlet, outletScope]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/online-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
      }
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Menunggu Konfirmasi',
          class: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
        };
      case 'PROCESSING':
        return {
          label: 'Sedang Packing',
          class: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
        };
      case 'READY':
        return {
          label: 'Siap Diambil / Kirim',
          class: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
        };
      case 'COMPLETED':
        return {
          label: 'Selesai',
          class: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'CANCELLED':
        return {
          label: 'Dibatalkan',
          class: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 line-through',
        };
      default:
        return { label: status, class: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' };
    }
  };

  const getOutletName = (id: string) => {
    if (id === 'toko-1') return 'Toko 1 (Pusat & Gudang)';
    if (id === 'toko-2') return 'Toko 2 (Cabang Satelit)';
    return id;
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Inbox className="size-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Antrean Pesanan Online
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pesanan langsung dari katalog publik (/shop) &bull; Konfirmasi pembayaran, packing, dan serah terima
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => setOutletScope('CURRENT')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                outletScope === 'CURRENT'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Outlet Ini
            </button>
            <button
              type="button"
              onClick={() => setOutletScope('ALL')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                outletScope === 'ALL'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Semua Cabang
            </button>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer shadow-xs transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin text-zinc-900 dark:text-zinc-100' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto scrollbar-none max-w-full py-0.5">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs w-fit shrink-0 shadow-xs">
          {[
            { label: 'Semua Pesanan', value: 'ALL' },
            { label: 'Menunggu Konfirmasi', value: 'PENDING' },
            { label: 'Sedang Diproses', value: 'PROCESSING' },
            { label: 'Siap Diambil/Kirim', value: 'READY' },
            { label: 'Selesai', value: 'COMPLETED' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading && orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
            Memuat daftar pesanan online...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
            Tidak ada pesanan online pada kategori ini.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isPickup = order.fulfillmentType === 'PICKUP';

            return (
              <div
                key={order.id}
                className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3.5"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {order.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          isPickup
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {isPickup ? 'Ambil di Toko' : 'Kirim Kurir'}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {order.customerName}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600">&bull;</span>
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="size-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      <Building2 className="size-3 text-zinc-400" />
                      <span>Cabang Pemenuhan: {getOutletName(order.outletId)}</span>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300 mt-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                        <MapPin className="size-3 text-zinc-400 shrink-0 mt-0.5" />
                        <span>Alamat: {order.deliveryAddress}</span>
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic mt-1">
                        Catatan: &ldquo;{order.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border self-start ${badge.class}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Ordered Items List */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-2 text-xs border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Barang yang Dipesan:
                  </span>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {item.productName}{' '}
                          <span className="text-zinc-400 dark:text-zinc-500 font-mono">
                            (&times;{item.qty})
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-200/80 dark:border-zinc-700/80 pt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Pembayaran:</span>
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {order.status === 'PENDING' &&
                      'Stok belum dipotong. Tekan tombol untuk konfirmasi bayar & potong stok.'}
                    {order.status === 'PROCESSING' &&
                      'Stok cabang telah dipotong atomik. Siapkan barang fisik.'}
                    {order.status === 'READY' &&
                      'Barang siap diserahkan ke pelanggan atau kurir.'}
                    {order.status === 'COMPLETED' && 'Pesanan telah selesai.'}
                    {order.status === 'CANCELLED' && 'Pesanan dibatalkan (stok dikembalikan).'}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          Tolak / Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                          disabled={actionLoading === order.id}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <PackageCheck className="size-3.5" />
                          <span>Konfirmasi &amp; Potong Stok</span>
                        </button>
                      </>
                    )}

                    {order.status === 'PROCESSING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          Batalkan (Rollback Stok)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          disabled={actionLoading === order.id}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Truck className="size-3.5" />
                          <span>Siap Diambil / Kirim</span>
                        </button>
                      </>
                    )}

                    {order.status === 'READY' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        disabled={actionLoading === order.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Selesaikan Pesanan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
