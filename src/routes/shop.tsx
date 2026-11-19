import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { themeStore, Theme } from '@/lib/themeStore';

export const Route = createFileRoute('/shop')({
  component: PublicShopPage,
});

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

function PublicShopPage() {
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

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

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
          notes: orderNotes.trim(),
          items: cart.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
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

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const outletInfo = {
    'toko-1': {
      name: 'Toko 1 (Pusat & Gudang)',
      address: 'Jl. Pemuda No. 12, Cirebon',
      wa: '6281234567801',
    },
    'toko-2': {
      name: 'Toko 2 (Cabang Satelit)',
      address: 'Jl. Kesambi No. 45, Cirebon',
      wa: '6281234567802',
    },
  }[selectedOutlet];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-24 transition-colors">
      {/* ─── PUBLIC TOP HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Store className="size-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-zinc-900 dark:text-zinc-100 tracking-tight">
                Katalog Toko Online
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Pesan mandiri &bull; Ambil di toko atau kirim kurir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => themeStore.toggleTheme()}
              className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {currentTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <Link
              to="/"
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium px-2.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:block"
            >
              Portal Kasir &rarr;
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer relative transition-colors"
            >
              <ShoppingBag className="size-4" />
              <span>Keranjang</span>
              {totalCartCount > 0 && (
                <span className="bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Branch Selector Bar */}
        <div className="bg-zinc-100/70 dark:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-800/80 px-4 py-2">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
              <MapPin className="size-3.5 text-zinc-500 shrink-0" />
              <span>Lokasi Cabang Pemenuhan:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'toko-1', label: 'Toko 1 (Pusat & Gudang)' },
                { id: 'toko-2', label: 'Toko 2 (Cabang Satelit)' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSwitchOutlet(b.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedOutlet === b.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Branch Details Banner */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Cabang Pemenuhan Aktif:
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {outletInfo.name}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">{outletInfo.address}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] space-y-0.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Stok Real-Time</span>
            <span>Katalog di bawah disesuaikan khusus stok fisik cabang ini.</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari beras, minyak, kecap, atau produk lainnya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1.5 w-fit">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            Memuat katalog produk cabang...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            Tidak ada produk yang cocok dengan pencarian Anda di cabang ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id);
              const isAvailable = p.stock > 0;

              return (
                <div
                  key={p.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isAvailable
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isAvailable ? `Stok: ${p.stock} ${p.unit}` : 'Habis di Cabang Ini'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      SKU: {p.sku} &bull; Satuan: {p.unit}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Harga</span>
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                        {formatRupiah(p.sellingPrice)}
                      </span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, -1)}
                          className="size-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-2 text-zinc-900 dark:text-zinc-100">
                          {inCart.qty}
                        </span>
                        <button
                          type="button"
                          disabled={inCart.qty >= p.stock}
                          onClick={() => updateCartQty(p.id, 1)}
                          className="size-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => addToCart(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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

      {/* ─── FLOATING BOTTOM BAR (MOBILE / DESKTOP) ─────────────────────────── */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-md hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 p-3.5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer border border-zinc-700/60 dark:border-zinc-300/60 transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2.5 text-xs text-left">
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                {totalCartCount}
              </div>
              <div>
                <span className="font-bold block">{totalCartCount} Barang di Keranjang</span>
                <span className="text-[11px] opacity-75">Siap untuk checkout</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-emerald-400 dark:text-emerald-700">
                {formatRupiah(totalCartAmount)}
              </span>
              <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      )}

      {/* ─── CART & CHECKOUT MODAL DRAWER ───────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Keranjang Belanja</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Cabang: {outletInfo.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="size-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {checkoutError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2 text-xs">
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Daftar Barang:
                </span>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.product.name}</h4>
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 block">
                        {formatRupiah(item.product.sellingPrice)} &times; {item.qty} ={' '}
                        <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                          {formatRupiah(item.product.sellingPrice * item.qty)}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="size-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold text-xs w-5 text-center text-zinc-900 dark:text-zinc-100">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        disabled={item.qty >= item.product.stock}
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="size-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="size-6 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 flex items-center justify-center ml-1 cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfillment Option */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Metode Pemenuhan:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('PICKUP')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      fulfillmentType === 'PICKUP'
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 font-bold shadow-xs'
                        : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="block font-bold text-xs">Ambil di Toko</span>
                    <span className="block text-[10px] opacity-75">Gratis &bull; Langsung di kasir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('DELIVERY')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      fulfillmentType === 'DELIVERY'
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 font-bold shadow-xs'
                        : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="block font-bold text-xs">Kirim Kurir Lokal</span>
                    <span className="block text-[10px] opacity-75">Antar ke alamat Anda</span>
                  </button>
                </div>
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Nama Lengkap Pemesan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rina Susanti"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono"
                  />
                </div>

                {fulfillmentType === 'DELIVERY' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Alamat Lengkap Pengiriman *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, patokan..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Catatan Pesanan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Titipkan di pos satpam / Telp sebelum tiba"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Total Tagihan:</span>
                <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100 block">
                  {formatRupiah(totalCartAmount)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || cart.length === 0}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim Pesanan...' : 'Pesan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDER COMPLETED SUCCESS MODAL ──────────────────────────────────── */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Menunggu Konfirmasi Toko
              </span>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-2">Pesanan Berhasil Dibuat!</h3>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                ID Pesanan: {completedOrder.id}
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-left text-xs border border-zinc-200/60 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Cabang:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{outletInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Pemesan:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Metode:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {completedOrder.fulfillmentType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim Kurir'}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200/80 dark:border-zinc-700 pt-1.5">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Pembayaran:</span>
                <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(completedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Silakan konfirmasi pesanan Anda melalui WhatsApp ke staf kasir toko kami agar segera disiapkan.
            </p>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${outletInfo.wa}?text=${encodeURIComponent(
                  `Halo ${outletInfo.name}, saya ingin konfirmasi pesanan online dengan ID: *${completedOrder.id}* atas nama *${completedOrder.customerName}* senilai ${formatRupiah(completedOrder.totalAmount)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>Konfirmasi via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
