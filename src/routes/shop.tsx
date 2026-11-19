import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Store,
  Building2,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  ArrowRight,
  X,
  AlertCircle,
  MessageCircle,
  Sun,
  Moon,
  Clock,
  QrCode,
  CreditCard,
  Banknote,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { themeStore, Theme } from '@/lib/themeStore';
import { playBeep } from '@/lib/audio';

export const Route = createFileRoute('/shop')({
  component: PublicShopPage,
});

const font = {
  fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",
} as const;

interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
  stock: number;
  isLow: boolean;
}

interface CartItem {
  product: ProductItem;
  qty: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  ALL: '🛍️',
  Sembako: '🌾',
  Minuman: '☕',
  'Bahan Kue': '🍰',
  'Bumbu Dapur': '🧂',
  Kebersihan: '🧼',
  'Makanan Cepat': '🍜',
  Snack: '🍪',
};

export function PublicShopPage() {
  const [selectedOutlet, setSelectedOutlet] = useState<'toko-1' | 'toko-2'>('toko-1');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeStore.getTheme());

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'TRANSFER' | 'CASH'>('QRIS');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const unsub = themeStore.subscribe((t) => setCurrentTheme(t));
    return unsub;
  }, []);

  const fetchCatalog = () => {
    setLoading(true);
    fetch(`/api/products?outletId=${selectedOutlet}&q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedOutlet, searchQuery]);

  // Handle Switch Outlet
  const handleSwitchOutlet = (outletId: 'toko-1' | 'toko-2') => {
    if (outletId !== selectedOutlet) {
      setSelectedOutlet(outletId);
      setCart([]);
    }
  };

  // Cart Actions
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) return;
    playBeep(1400, 0.05);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    playBeep(delta > 0 ? 1500 : 900, 0.04);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.qty,
    0
  );

  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory === 'ALL') return true;
      return p.category === selectedCategory;
    });
  }, [products, selectedCategory]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError('Keranjang Anda masih kosong.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Harap lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      setCheckoutError('Alamat pengiriman wajib diisi untuk layanan kurir.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: selectedOutlet,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          fulfillmentType,
          deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : null,
          notes: orderNotes.trim() ? `[${paymentMethod}] ${orderNotes.trim()}` : `[${paymentMethod}]`,
          items: cart.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1200, 0.15);
        setCompletedOrder(data.order);
        setCart([]);
        setIsCartOpen(false);
      } else {
        setCheckoutError(data.error || 'Gagal membuat pesanan online.');
      }
    } catch {
      setCheckoutError('Terjadi gangguan jaringan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  const outletInfo = {
    'toko-1': {
      id: 'toko-1',
      name: 'Toko 1 (Pusat & Gudang)',
      tag: 'Gudang Pasokan Induk',
      address: 'Jl. Pemuda No. 12, Cirebon',
      hours: 'Buka 07:00 - 21:00 WIB',
      distance: '1.2 km dari Anda',
      wa: '6281234567801',
    },
    'toko-2': {
      id: 'toko-2',
      name: 'Toko 2 (Cabang Satelit)',
      tag: 'Cabang Retail Satelit',
      address: 'Jl. Kesambi No. 45, Cirebon',
      hours: 'Buka 08:00 - 21:30 WIB',
      distance: '2.5 km dari Anda',
      wa: '6281234567802',
    },
  }[selectedOutlet];

  return (
    <div style={font} className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 font-sans pb-28 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShoppingBag className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm leading-tight text-gray-900 dark:text-neutral-50 tracking-tight truncate">
                  POS Belanja Online
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                  Model B
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                Pesan mandiri, ambil di toko atau kirim kurir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = currentTheme === 'dark' ? 'light' : 'dark';
                themeStore.setTheme(next);
                setCurrentTheme(next);
              }}
              className="p-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors shadow-2xs"
              title="Ganti Tema Terang/Gelap"
            >
              {currentTheme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            {/* Back to POS Kasir */}
            <Link
              to="/pos"
              className="px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Store className="size-3.5" />
              <span className="hidden sm:inline">Kasir POS</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Branch Selector Banner */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                PILIH CABANG PEMENUHAN STOK:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-neutral-50 tracking-tight">
                  {outletInfo.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {outletInfo.hours}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-gray-400 shrink-0" />
                <span>{outletInfo.address} &bull; <strong className="text-gray-700 dark:text-neutral-300 font-semibold">{outletInfo.distance}</strong></span>
              </p>
            </div>

            {/* Branch Switch Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl border border-gray-200/60 dark:border-neutral-700/60 w-fit shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-1')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedOutlet === 'toko-1'
                    ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-50 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-neutral-400'
                }`}
              >
                <Building2 className="size-3.5" />
                <span>Toko 1 (Gudang)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-2')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedOutlet === 'toko-2'
                    ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-50 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-neutral-400'
                }`}
              >
                <Store className="size-3.5" />
                <span>Toko 2 (Cabang)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Sticky Category Pills */}
        <div className="space-y-3 sticky top-14 z-20 bg-gray-50/95 dark:bg-neutral-950/95 backdrop-blur-md pt-2 pb-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Cari produk di ${outletInfo.name} (beras, minyak, kecap)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100 font-medium shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Horizontal Scroll Pills */}
          <div className="overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 w-fit">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const icon = CATEGORY_ICONS[cat] || '📦';
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                        : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200/80 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{cat === 'ALL' ? 'Semua Produk' : cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs">
            Memuat katalog produk cabang...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs">
            Tidak ada produk yang cocok dengan pencarian di cabang ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id);
              const isAvailable = p.stock > 0;
              const isLowStock = isAvailable && p.stock <= 5;

              return (
                <div
                  key={p.id}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between gap-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          !isAvailable
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {!isAvailable
                          ? 'Habis di Cabang Ini'
                          : isLowStock
                          ? `Sisa ${p.stock} ${p.unit}`
                          : `Stok: ${p.stock} ${p.unit}`}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 dark:text-neutral-100 leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="font-mono text-[11px] text-gray-400 dark:text-neutral-500">
                      SKU: {p.sku} &bull; Satuan: {p.unit}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 block">Harga Satuan</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-extrabold text-sm text-gray-900 dark:text-neutral-50">
                          {formatRupiah(p.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">/{p.unit}</span>
                      </div>
                    </div>

                    {/* Inline Quantity Stepper or Add Button */}
                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl border border-gray-200/60 dark:border-neutral-700/60">
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, -1)}
                          className="size-7 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono font-extrabold text-xs px-2 text-gray-900 dark:text-neutral-50 min-w-5 text-center">
                          {inCart.qty}
                        </span>
                        <button
                          type="button"
                          disabled={inCart.qty >= p.stock}
                          onClick={() => updateCartQty(p.id, 1)}
                          className="size-7 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => addToCart(p)}
                        className="px-4 py-2 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="size-3.5" />
                        <span>Beli</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {totalCartCount > 0 && !isCartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40"
          >
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gray-900/95 dark:bg-neutral-50/95 backdrop-blur-md text-white dark:text-neutral-900 p-3.5 rounded-3xl shadow-2xl flex items-center justify-between cursor-pointer border border-gray-700/60 dark:border-neutral-300/60 transition-transform active:scale-98"
            >
              <div className="flex items-center gap-3 text-xs text-left">
                <div className="size-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-extrabold font-mono shadow-xs">
                  {totalCartCount}
                </div>
                <div>
                  <span className="font-extrabold block text-sm">
                    {totalCartCount} Barang di Keranjang
                  </span>
                  <span className="text-[11px] opacity-75 font-mono">
                    Total: {formatRupiah(totalCartAmount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-1">
                <span className="font-bold text-xs bg-white/20 dark:bg-neutral-900/20 px-3 py-1.5 rounded-xl">
                  Checkout
                </span>
                <ArrowRight className="size-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart & Checkout Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/60 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 flex items-center justify-center">
                    <ShoppingBag className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-50">
                      Keranjang &amp; Checkout
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Cabang: {outletInfo.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="size-8 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {checkoutError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2 text-xs">
                    <AlertCircle className="size-4 text-rose-600 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                      Daftar Barang ({cart.length} SKU):
                    </span>
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer"
                    >
                      Kosongkan Keranjang
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-200/60 dark:border-neutral-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-neutral-100 truncate text-xs">
                          {item.product.name}
                        </h4>
                        <span className="font-mono text-[11px] text-gray-500 dark:text-neutral-400 block mt-0.5">
                          {formatRupiah(item.product.sellingPrice)} &times; {item.qty} ={' '}
                          <strong className="text-gray-900 dark:text-neutral-50 font-bold">
                            {formatRupiah(item.product.sellingPrice * item.qty)}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono font-bold text-xs w-5 text-center text-gray-900 dark:text-neutral-50">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.qty >= item.product.stock}
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="size-6 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-600 flex items-center justify-center ml-1 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment Option */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Pilih Layanan Pengambilan:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('PICKUP')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        fulfillmentType === 'PICKUP'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100 shadow-2xs font-bold'
                          : 'bg-white dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      <span className="block font-bold text-xs">Ambil Sendiri di Toko</span>
                      <span className="block text-[10px] opacity-75 mt-0.5">Gratis &bull; Langsung di kasir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillmentType('DELIVERY')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        fulfillmentType === 'DELIVERY'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100 shadow-2xs font-bold'
                          : 'bg-white dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      <span className="block font-bold text-xs">Kirim Kurir Instan</span>
                      <span className="block text-[10px] opacity-75 mt-0.5">Antar langsung ke alamat</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Metode Pembayaran:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        paymentMethod === 'QRIS'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 font-bold shadow-2xs'
                          : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      <QrCode className="size-4 mx-auto mb-1" />
                      <span className="block text-[10px]">QRIS Instant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TRANSFER')}
                      className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        paymentMethod === 'TRANSFER'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 font-bold shadow-2xs'
                          : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      <CreditCard className="size-4 mx-auto mb-1" />
                      <span className="block text-[10px]">Transfer Bank</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 font-bold shadow-2xs'
                          : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      <Banknote className="size-4 mx-auto mb-1" />
                      <span className="block text-[10px]">Bayar di Toko</span>
                    </button>
                  </div>
                </div>

                {/* Checkout Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-neutral-300 block text-xs">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Rina Susanti"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-2.5 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-neutral-300 block text-xs">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-2.5 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100 font-mono"
                    />
                  </div>

                  {fulfillmentType === 'DELIVERY' && (
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 dark:text-neutral-300 block text-xs">
                        Alamat Lengkap Pengiriman *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-2.5 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-neutral-300 block text-xs">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Titipkan di pos satpam / Telp sebelum tiba"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-2.5 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100"
                    />
                  </div>
                </form>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-800/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 block">Total Pembayaran:</span>
                  <span className="font-mono font-extrabold text-base text-gray-900 dark:text-neutral-50 block">
                    {formatRupiah(totalCartAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan Sekarang'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Completed Success Modal */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 text-center space-y-4"
            >
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="size-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Menunggu Konfirmasi Toko
                </span>
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-neutral-50 mt-2.5">
                  Pesanan Berhasil Dibuat!
                </h3>
                <p className="font-mono text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  ID: <strong className="text-gray-900 dark:text-neutral-100">{completedOrder.id}</strong>
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-neutral-800/40 rounded-2xl text-left text-xs border border-gray-200/60 dark:border-neutral-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Cabang:</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">{outletInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Pemesan:</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Metode:</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {completedOrder.fulfillmentType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim Kurir'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200/80 dark:border-neutral-700 pt-2 font-bold text-sm">
                  <span>Total Tagihan:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(completedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                Tekan tombol di bawah untuk membuka WhatsApp toko dan mengirim konfirmasi agar pesanan Anda langsung dipacking.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/${outletInfo.wa}?text=${encodeURIComponent(
                    `Halo ${outletInfo.name}, saya ingin konfirmasi pesanan online dengan ID: *${completedOrder.id}* atas nama *${completedOrder.customerName}* senilai ${formatRupiah(completedOrder.totalAmount)}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>Konfirmasi ke WhatsApp Toko</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Belanja Lagi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
