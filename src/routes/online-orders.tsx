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
          class: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'PROCESSING':
        return {
          label: 'Sedang Packing (Stok Terpotong)',
          class: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'READY':
        return {
          label: 'Siap Diambil / Kirim',
          class: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'COMPLETED':
        return {
          label: 'Selesai',
          class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'CANCELLED':
        return {
          label: 'Dibatalkan',
          class: 'bg-stone-100 text-stone-600 border-stone-200 line-through',
        };
      default:
        return { label: status, class: 'bg-stone-100 text-stone-600' };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            Antrean Pesanan Online Masuk
          </h2>
          <p className="text-xs text-stone-500">
            Kelola pesanan dari etalase publik (/shop) &bull; Konfirmasi, packing, dan serah terima
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Toggle */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-bold text-stone-600">
            <button
              type="button"
              onClick={() => setOutletScope('CURRENT')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                outletScope === 'CURRENT' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
              }`}
            >
              Outlet Ini Saja
            </button>
            <button
              type="button"
              onClick={() => setOutletScope('ALL')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                outletScope === 'ALL' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
              }`}
            >
              Semua Cabang
            </button>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 cursor-pointer shadow-2xs"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto scrollbar-none max-w-full py-0.5">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-xl text-xs w-fit shrink-0">
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

      {/* Orders List */}
      <div className="space-y-3">
        {loading && orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white border border-stone-200 rounded-2xl">
            Memuat daftar pesanan online...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white border border-stone-200 rounded-2xl">
            Tidak ada pesanan online pada filter ini.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isPickup = order.fulfillmentType === 'PICKUP';

            return (
              <div
                key={order.id}
                className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3.5"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-stone-900">
                        {order.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPickup
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isPickup ? 'Ambil di Toko' : 'Kirim Kurir'}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-xs text-stone-900">
                        {order.customerName}
                      </span>
                      <span className="text-stone-300">&bull;</span>
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold font-mono flex items-center gap-1"
                      >
                        <MessageCircle className="size-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                      <Building2 className="size-3 text-stone-400" />
                      <span>Pemenuhan: {getOutletName(order.outletId)}</span>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-1.5 text-[11px] text-stone-600 mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <MapPin className="size-3 text-stone-400 shrink-0 mt-0.5" />
                        <span>Alamat: {order.deliveryAddress}</span>
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-stone-500 italic mt-1">
                        Catatan: &ldquo;{order.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border self-start ${badge.class}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Ordered Items Table / List */}
                <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-xs border border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Barang yang Dipesan:
                  </span>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-stone-800">
                          {item.productName}{' '}
                          <span className="text-stone-400 font-normal">
                            (&times;{item.qty})
                          </span>
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200/80 pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">Total Pembayaran:</span>
                    <span className="font-mono font-black text-sm text-emerald-800">
                      {formatRupiah(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
                  <span className="text-[11px] text-stone-400">
                    {order.status === 'PENDING' &&
                      'Stok belum dipotong. Tekan tombol untuk konfirmasi bayar & potong stok.'}
                    {order.status === 'PROCESSING' &&
                      'Stok cabang telah dipotong atomik. Siapkan barang fisik.'}
                    {order.status === 'READY' &&
                      'Barang siap diambil oleh pelanggan atau diserahkan ke kurir.'}
                    {order.status === 'COMPLETED' && 'Pesanan selesai.'}
                    {order.status === 'CANCELLED' && 'Pesanan dibatalkan (stok aman).'}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                        >
                          Tolak / Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                          disabled={actionLoading === order.id}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <PackageCheck className="size-3.5" />
                          <span>Konfirmasi &amp; Packing (Potong Stok)</span>
                        </button>
                      </>
                    )}

                    {order.status === 'PROCESSING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                        >
                          Batalkan (Rollback Stok)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          disabled={actionLoading === order.id}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
