import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Building2,
  Receipt,
  RotateCcw,
  Plus,
  Minus,
  Camera,
  Printer,
  Wallet,
  Store,
  ArrowLeft,
  LayoutDashboard,
  Package,
  QrCode,
  Bell,
} from 'lucide-react';
import { outletStore, OutletId, OUTLET_CONFIG } from '@/lib/outletStore';
import { authStore, UserProfile } from '@/lib/authStore';
import { playBeep } from '@/lib/audio';
import { shiftStore, ShiftSession } from '@/lib/shiftStore';
import { useOnlineOrderAlerts } from '@/lib/useOnlineOrderAlerts';
import { ThermalReceiptModal, ThermalReceiptData } from '@/components/pos/ThermalReceiptModal';
import { ShiftModal } from '@/components/pos/ShiftModal';
import { BarcodeScannerModal } from '@/components/pos/BarcodeScannerModal';
import { MidtransQrisModal } from '@/components/pos/MidtransQrisModal';
import { PosReturnModal } from '@/components/pos/PosReturnModal';
import { FALLBACK_PRODUCT_IMAGES, INITIAL_SEMBAKO_PRODUCTS } from '@/routes/shop';

export const Route = createFileRoute('/pos')({
  component: PosPage,
});

const font = {
  fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",
} as const;

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  maxStock: number;
  image?: string;
}

function PosPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authStore.getUser());
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(() => {
    const user = authStore.getUser();
    if (user?.outletId === 'toko-1' || user?.outletId === 'toko-2') {
      return user.outletId;
    }
    return outletStore.getOutlet();
  });
  const [products, setProducts] = useState<any[]>(() =>
    INITIAL_SEMBAKO_PRODUCTS.map((p) => ({
      ...p,
      t1Stock: p.stock,
      t2Stock: p.id === 'p-1' ? 4 : Math.max(3, Math.floor(p.stock * 0.45)),
      isLow: p.id === 'p-1',
    }))
  );
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [midtransModalData, setMidtransModalData] = useState<{
    isOpen: boolean;
    orderId: string | null;
    grossAmount: number;
  } | null>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [thermalModalOrder, setThermalModalOrder] = useState<ThermalReceiptData | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<ShiftSession | null>(() =>
    shiftStore.getActiveShift(activeOutlet)
  );
  const { pendingCount: pendingOnlineCount } = useOnlineOrderAlerts(activeOutlet);

  useEffect(() => {
    const unsubOutlet = outletStore.subscribe((id) => {
      setActiveOutlet(id);
      setCart([]);
      setLastOrder(null);
      setErrorMessage(null);
      setCurrentShift(shiftStore.getActiveShift(id));
    });
    const unsubAuth = authStore.subscribe((u) => {
      setCurrentUser(u);
      if (u?.outletId === 'toko-1' || u?.outletId === 'toko-2') {
        outletStore.setOutlet(u.outletId);
      }
    });
    return () => {
      unsubOutlet();
      unsubAuth();
    };
  }, []);

  const loadProducts = () => {
    fetch(`/api/products?outletId=${activeOutlet}&q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, [search, activeOutlet]);

  const addToCart = useCallback((prod: any) => {
    const available = prod.stock ?? 0;
    if (available <= 0) {
      setErrorMessage(`Stok "${prod.name}" habis di outlet ini.`);
      return;
    }

    setErrorMessage(null);
    playBeep(1400, 0.06);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        if (existing.qty >= available) {
          setErrorMessage(`Maksimal ${available} item untuk "${prod.name}" sesuai stok outlet.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === prod.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.sellingPrice,
          qty: 1,
          maxStock: available,
          image: prod.image || FALLBACK_PRODUCT_IMAGES[prod.id],
        },
      ];
    });
  }, []);

  // Hardware USB Barcode Scanner Gun Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 120) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const matched = products.find(
            (p) =>
              (p.barcode && p.barcode.toLowerCase() === buffer.toLowerCase()) ||
              (p.sku && p.sku.toLowerCase() === buffer.toLowerCase())
          );
          if (matched) {
            addToCart(matched);
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart]);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === id) {
            const newQty = item.qty + delta;
            if (newQty > item.maxStock) {
              setErrorMessage(`Maksimal stok tercapai (${item.maxStock})`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const change = Math.max(0, cashReceived - totalAmount);
  const currentOutletInfo = OUTLET_CONFIG[activeOutlet];

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    // Midtrans Sandbox Flow
    if (posPaymentMethod === 'QRIS') {
      try {
        const res = await fetch('/api/pos/midtrans/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outletId: activeOutlet,
            items: cart,
            cashierName: currentUser?.name || 'Kasir',
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setMidtransModalData({
            isOpen: true,
            orderId: data.orderId,
            grossAmount: data.grossAmount,
          });
        } else {
          setErrorMessage(data.error || 'Gagal membuat tagihan QRIS Midtrans Sandbox.');
        }
      } catch {
        setErrorMessage('Terjadi gangguan jaringan saat menghubungi gateway Midtrans.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Cash Payment Flow
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: activeOutlet,
          items: cart,
          paymentMethod: 'CASH',
          cashReceived: cashReceived || totalAmount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1200, 0.12);
        setLastOrder(data.order);
        shiftStore.recordTransaction(activeOutlet, 'CASH', data.order.totalAmount);
        setCurrentShift(shiftStore.getActiveShift(activeOutlet));
        setThermalModalOrder({
          ...data.order,
          outletAddress: currentOutletInfo.address,
          cashierName: currentUser?.name || 'Kasir',
        });
        setCart([]);
        setCashReceived(0);
        loadProducts();
      } else {
        setErrorMessage(data.error || 'Gagal memproses transaksi.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={font} className="min-h-screen bg-gray-50 dark:bg-black font-sans p-4 sm:p-6 space-y-4">
      {/* Top Header Bar matching BagUI */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Kembali ke Dashboard BagUI"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <img src="/brand-logo.svg" alt="POS Logo" className="size-9 rounded-xl shadow-2xs shrink-0" />
          <div>
            <h1 className="font-extrabold text-base text-gray-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
              <span>Terminal Kasir POS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live POS
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Transaksi kasir langsung, cetak struk thermal 58mm/80mm &amp; scan barcode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Online Order Alert Pill */}
          <Link
            to="/online-orders"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
              pendingOnlineCount > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20'
                : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
            }`}
            title="Lihat antrean pesanan online masuk di cabang ini"
          >
            <Bell className={`size-3.5 ${pendingOnlineCount > 0 ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">Pesanan Online</span>
            {pendingOnlineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                {pendingOnlineCount}
              </span>
            )}
          </Link>

          {/* Riwayat & Retur POS Button (F-13) */}
          <button
            type="button"
            onClick={() => setIsReturnModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Riwayat transaksi POS, cetak ulang struk & retur barang"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">Riwayat &amp; Retur</span>
          </button>

          {/* Shift Button */}
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
              currentShift
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300'
            }`}
          >
            <Wallet className="size-3.5" />
            <span>{currentShift ? `Shift Aktif (${currentShift.totalTransactions} Trx)` : 'Buka Shift Kasir'}</span>
            <span className={`size-2 rounded-full ${currentShift ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          <Link
            to="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <LayoutDashboard className="size-3.5" />
            <span className="hidden sm:inline">BagUI Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Outlet Banner */}
      <div
        className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-colors ${
          activeOutlet === 'toko-1'
            ? 'bg-blue-500/10 border-blue-500/20'
            : 'bg-emerald-500/10 border-emerald-500/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
              activeOutlet === 'toko-1' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}
          >
            {activeOutlet === 'toko-1' ? <Building2 className="size-5" /> : <Store className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                {currentOutletInfo.name}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeOutlet === 'toko-1'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {activeOutlet === 'toko-1' ? 'Stok Fisik Gudang Pusat' : 'Stok Fisik Rak Cabang'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-neutral-400 mt-0.5">
              <span>{currentOutletInfo.address}</span>
              {currentUser && (
                <>
                  <span>&bull;</span>
                  <span className="font-semibold text-gray-800 dark:text-neutral-200">
                    Kasir: {currentUser.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Branch Buttons */}
          <button
            type="button"
            onClick={() => outletStore.setOutlet('toko-1')}
            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeOutlet === 'toko-1'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700'
            }`}
          >
            Toko 1 (Gudang)
          </button>
          <button
            type="button"
            onClick={() => outletStore.setOutlet('toko-2')}
            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeOutlet === 'toko-2'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700'
            }`}
          >
            Toko 2 (Cabang)
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
          <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Product Catalog & Search */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="size-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Cari stok barang di ${currentOutletInfo.shortName} (beras, minyak, kecap)...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsScannerModalOpen(true)}
              className="px-3.5 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Pindai barcode via kamera atau scanner gun USB"
            >
              <Camera className="size-4" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {products.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const otherBranchStock = activeOutlet === 'toko-2' ? p.t1Stock : p.t2Stock;
              const imgUrl = p.image || FALLBACK_PRODUCT_IMAGES[p.id];

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`group p-2.5 bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed bg-gray-50/50 dark:bg-neutral-950/40'
                      : 'hover:border-gray-400 dark:hover:border-neutral-600 hover:shadow-sm cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div>
                    {/* Product Image Thumbnail */}
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800/80 mb-2">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-neutral-600">
                          <Package className="size-6" />
                        </div>
                      )}
                      {p.category && (
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                          {p.category}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-gray-400 dark:text-neutral-500 font-semibold">{p.sku}</span>
                        <span className="text-gray-400 dark:text-neutral-500">{p.unit}</span>
                      </div>
                      <h3 className="font-bold text-xs text-gray-900 dark:text-neutral-100 line-clamp-2 leading-tight">
                        {p.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Harga:</span>
                      <span className="font-mono font-bold text-xs text-gray-900 dark:text-neutral-100">
                        Rp {p.sellingPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">Stok Cabang:</span>
                      <span
                        className={`font-mono font-bold px-1.5 py-0.5 rounded-md ${
                          isOutOfStock
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : p.isLow
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </div>

                    {isOutOfStock && (
                      <p className="text-[9px] text-gray-400 pt-0.5 italic">
                        Stok di {activeOutlet === 'toko-2' ? 'Toko 1 (Gudang)' : 'Toko 2 (Cabang)'}: {otherBranchStock} {p.unit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Checkout Panel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                  Keranjang Kasir ({cart.length} Item)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-neutral-500 space-y-1">
                  <p>Keranjang masih kosong.</p>
                  <p className="text-[10px]">Klik produk di sebelah kiri atau scan barcode.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="size-9 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-neutral-700"
                        />
                      ) : (
                        <div className="size-9 rounded-lg bg-gray-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                          <Package className="size-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-neutral-100 truncate">{item.name}</p>
                        <p className="font-mono text-[11px] text-gray-500 dark:text-neutral-400">
                          Rp {item.price.toLocaleString('id-ID')} &times; {item.qty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, -1)}
                        className="size-6 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer font-bold text-gray-700 dark:text-neutral-300"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold text-xs w-5 text-center text-gray-900 dark:text-neutral-100">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, 1)}
                        className="size-6 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer font-bold text-gray-700 dark:text-neutral-300"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="size-6 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer ml-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Calculation */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-gray-600 dark:text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-mono">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-gray-900 dark:text-neutral-100 pt-1">
                <span>Total Bayar:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-neutral-400 block">
                Metode Pembayaran Kasir
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPosPaymentMethod('CASH')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    posPaymentMethod === 'CASH'
                      ? 'bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-gray-900 dark:border-neutral-100 shadow-2xs'
                      : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700'
                  }`}
                >
                  <Wallet className="size-3.5" />
                  <span>Uang Tunai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPosPaymentMethod('QRIS')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    posPaymentMethod === 'QRIS'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700'
                  }`}
                >
                  <QrCode className="size-3.5" />
                  <span>QRIS Sandbox</span>
                </button>
              </div>
            </div>

            {/* Cash Input Section (Only for Cash mode) */}
            {posPaymentMethod === 'CASH' ? (
              <>
                {totalAmount > 0 && (
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(totalAmount)}
                      className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-[10px] font-bold text-gray-700 dark:text-neutral-300 cursor-pointer"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickCash(amt)}
                        className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-[10px] font-mono font-bold text-gray-700 dark:text-neutral-300 cursor-pointer"
                      >
                        {(amt / 1000)}k
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-neutral-400 block">
                    Uang Tunai Diterima (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    placeholder={`Contoh: ${totalAmount}`}
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-neutral-100 font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                {cashReceived > 0 && (
                  <div className="flex justify-between text-xs font-bold p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 text-gray-700 dark:text-neutral-300">
                    <span>Kembalian:</span>
                    <span className="tabular-nums font-black font-mono text-emerald-600 dark:text-emerald-400">
                      Rp {change.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <QrCode className="size-3.5" />
                  <span>Midtrans Sandbox Gateway</span>
                </div>
                <p className="text-[10px] opacity-90">
                  QR dinamis akan dibuat otomatis. Stok baru terpotong saat webhook resmi settlement diterima.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-extrabold text-xs shadow-xs disabled:opacity-40 transition-all cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting
                ? 'Memproses Transaksi...'
                : posPaymentMethod === 'CASH'
                ? 'Selesaikan Transaksi Tunai & Struk'
                : 'Buka QRIS Midtrans Sandbox'}
            </button>
          </div>

          {/* Struk Digital Ringkas */}
          {lastOrder && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200">
                  <Receipt className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Struk Digital Kasir</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {lastOrder.id}
                </span>
              </div>

              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 space-y-0.5">
                <p className="font-bold">{lastOrder.outletName}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {new Date(lastOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-1 py-1 text-[11px]">
                {lastOrder.items.map((it: any) => (
                  <div key={it.productId} className="flex justify-between">
                    <span className="text-gray-800 dark:text-neutral-200 font-medium">{it.productName} x{it.qty}</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-neutral-100">
                      Rp {it.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1.5 flex justify-between font-black text-xs text-emerald-950 dark:text-emerald-100">
                <span>Total:</span>
                <span className="font-mono">Rp {lastOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                <span>Tunai: Rp {lastOrder.cashReceived.toLocaleString('id-ID')}</span>
                <span>Kembali: Rp {lastOrder.cashChange.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setThermalModalOrder({
                      ...lastOrder,
                      outletAddress: currentOutletInfo.address,
                      cashierName: currentUser?.name || 'Kasir',
                    });
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <Printer className="size-3.5" />
                  <span>Cetak Struk Thermal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLastOrder(null)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thermal Receipt Print Modal */}
      <ThermalReceiptModal
        order={thermalModalOrder}
        onClose={() => setThermalModalOrder(null)}
      />

      {/* Cashier Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        outletId={activeOutlet}
        outletName={currentOutletInfo.name}
        cashierName={currentUser?.name || 'Kasir Toko'}
        onClose={() => setIsShiftModalOpen(false)}
        onShiftChanged={(sh) => setCurrentShift(sh)}
      />

      {/* Barcode Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        products={products}
        onScanSuccess={(prod) => addToCart(prod)}
        onClose={() => setIsScannerModalOpen(false)}
      />

      {/* Midtrans Sandbox QRIS Digital Payment Modal */}
      <MidtransQrisModal
        isOpen={Boolean(midtransModalData?.isOpen)}
        orderId={midtransModalData?.orderId || null}
        grossAmount={midtransModalData?.grossAmount || 0}
        outletName={currentOutletInfo.name}
        cashierName={currentUser?.name || 'Kasir'}
        onSuccess={(order) => {
          playBeep(1200, 0.12);
          setLastOrder(order);
          shiftStore.recordTransaction(activeOutlet, 'QRIS', order.totalAmount);
          setCurrentShift(shiftStore.getActiveShift(activeOutlet));
          setThermalModalOrder({
            ...order,
            outletAddress: currentOutletInfo.address,
            cashierName: currentUser?.name || 'Kasir',
          });
          setCart([]);
          setCashReceived(0);
          setMidtransModalData(null);
          loadProducts();
        }}
        onClose={() => setMidtransModalData(null)}
      />

      {/* POS Transaction History & Void / Return Modal (F-13) */}
      <PosReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        activeOutlet={activeOutlet}
        cashierName={currentUser?.name || 'Kasir Toko'}
        onStockRestored={() => loadProducts()}
        onPrintReceipt={(order) => {
          setIsReturnModalOpen(false);
          setThermalModalOrder({
            ...order,
            cashReceived: order.cashReceived ?? order.totalAmount,
            cashChange: order.cashChange ?? 0,
            outletAddress: currentOutletInfo.address,
            cashierName: currentUser?.name || 'Kasir Toko',
          });
        }}
      />
    </div>
  );
}
