import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Store,
  Building2,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  MessageCircle,
  Sun,
  Moon,
  Star,
  BadgeCheck,
  ShieldCheck,
  QrCode,
  CreditCard,
  Banknote,
  Lock,
  LayoutDashboard,
  Trash2,
  ChevronRight,
  Check,
} from 'lucide-react';
import { themeStore, Theme } from '@/lib/themeStore';
import { authStore, UserProfile } from '@/lib/authStore';
import { playBeep } from '@/lib/audio';
import { cartStore, CartItem } from '@/lib/cartStore';
import { INITIAL_SEMBAKO_PRODUCTS, FALLBACK_PRODUCT_IMAGES, ProductItem } from '@/lib/productsData';

export const Route = createFileRoute('/product/$productId')({
  component: ProductDetailPage,
});

const font = {
  fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",
} as const;

export function ProductDetailPage() {
  const { productId } = Route.useParams();

  const [product, setProduct] = useState<ProductItem | null>(() => {
    return INITIAL_SEMBAKO_PRODUCTS.find((p) => p.id === productId) || null;
  });
  const [selectedOutletFulfillment, setSelectedOutletFulfillment] = useState<'toko-1' | 'toko-2'>('toko-1');
  const [buyQty, setBuyQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>(() => cartStore.getItems());
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

  const [currentTheme, setCurrentTheme] = useState<Theme>(themeStore.getTheme());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authStore.getUser());

  useEffect(() => {
    const unsubTheme = themeStore.subscribe((t) => setCurrentTheme(t));
    const unsubAuth = authStore.subscribe((u) => setCurrentUser(u));
    const unsubCart = cartStore.subscribe((items) => setCart(items));
    return () => {
      unsubTheme();
      unsubAuth();
      unsubCart();
    };
  }, []);

  // Fetch updated product from backend API if available
  useEffect(() => {
    fetch(`/api/products`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const found = data.find((p) => p.id === productId);
        if (found) {
          const initial = INITIAL_SEMBAKO_PRODUCTS.find((p) => p.id === productId);
          setProduct({
            ...found,
            outletId: initial?.outletId || 'toko-1',
            outletName: initial?.outletName || 'Toko 1 (Pusat & Gudang)',
            outletLocation: initial?.outletLocation || 'Jl. Pemuda, Cirebon',
            rating: initial?.rating || 4.9,
            soldCount: initial?.soldCount || 400,
            description: initial?.description || `${found.name} sembako pilihan terbaik keluarga Anda.`,
            specification: initial?.specification || {
              packaging: `Pack Standard ${found.unit}`,
              weight: `1 ${found.unit}`,
              shelfLife: '12 Bulan',
              origin: 'Produsen Terpercaya',
            },
            t1Stock: found.t1Stock ?? initial?.t1Stock ?? found.stock ?? 20,
            t2Stock: found.t2Stock ?? initial?.t2Stock ?? 10,
            image: found.image || initial?.image || FALLBACK_PRODUCT_IMAGES[productId],
          });
        }
      })
      .catch(() => {});
  }, [productId]);

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  if (!product) {
    return (
      <div style={font} className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="size-16 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-400 flex items-center justify-center mx-auto">
            <Store className="size-8" />
          </div>
          <h2 className="text-base font-extrabold">Produk Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500">Produk yang Anda cari tidak tersedia di etalase sembako.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Belanja</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeStock = selectedOutletFulfillment === 'toko-1' ? product.t1Stock : product.t2Stock;
  const isOutOfStock = activeStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    playBeep(1400, 0.06);
    cartStore.addItem(
      {
        id: product.id,
        name: product.name,
        sellingPrice: product.sellingPrice,
        unit: product.unit,
        stock: activeStock,
        image: product.image,
        outletId: selectedOutletFulfillment,
        outletName: selectedOutletFulfillment === 'toko-1' ? 'Toko 1 (Pusat & Gudang)' : 'Toko 2 (Cabang Satelit)',
      },
      buyQty
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleDirectBuy = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

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
    const primaryOutlet = cart[0]?.outletId || selectedOutletFulfillment;

    try {
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: primaryOutlet,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          fulfillmentType,
          deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : null,
          notes: orderNotes.trim() ? `[${paymentMethod}] ${orderNotes.trim()}` : `[${paymentMethod}]`,
          items: cart.map((item) => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1200, 0.15);
        setCompletedOrder(data.order);
        cartStore.clearCart();
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

  const totalCartCount = cartStore.getTotalCount();
  const totalCartAmount = cartStore.getTotalAmount();

  // Related products from same category
  const relatedProducts = INITIAL_SEMBAKO_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  return (
    <div style={font} className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 font-sans pb-28 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/shop"
              className="p-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              title="Kembali ke Etalase"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm leading-tight text-gray-900 dark:text-neutral-50 tracking-tight truncate">
                  Pasar Sembako Online
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                  Official Store
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                Rincian produk dan spesifikasi stok resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs transition-colors"
              title="Buka Keranjang"
            >
              <ShoppingBag className="size-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-mono font-bold size-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = currentTheme === 'dark' ? 'light' : 'dark';
                themeStore.setTheme(next);
                setCurrentTheme(next);
              }}
              className="p-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors shadow-2xs"
            >
              {currentTheme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            {/* Portal Kasir & Staf */}
            {currentUser ? (
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs flex items-center gap-1.5"
              >
                <LayoutDashboard className="size-3.5" />
                <span className="hidden sm:inline">{currentUser.name}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs flex items-center gap-1.5"
              >
                <Lock className="size-3.5" />
                <span>Portal Kasir</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500 overflow-x-auto whitespace-nowrap">
          <Link to="/shop" className="hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">
            Etalase Sembako
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          <span className="text-gray-600 dark:text-neutral-300 font-medium">{product.category}</span>
          <ChevronRight className="size-3 shrink-0" />
          <span className="text-gray-900 dark:text-neutral-100 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Packshot & Trust Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800/80">
                <img
                  src={product.image || FALLBACK_PRODUCT_IMAGES[product.id]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-gray-800 dark:text-neutral-200 shadow-2xs uppercase tracking-wider">
                  {product.category}
                </span>

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-neutral-900/95 text-gray-800 dark:text-neutral-200 backdrop-blur-md shadow-2xs border border-gray-200/60 dark:border-neutral-700/60">
                  {product.outletId === 'toko-1' ? (
                    <Building2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Store className="size-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{product.outletId === 'toko-1' ? 'Toko 1 (Pusat)' : 'Toko 2 (Cabang)'}</span>
                </div>
              </div>
            </div>

            {/* Quality & Guarantees */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Jaminan Kualitas Pasar Sembako:
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>100% Produk Asli &amp; Higienis Langsung Pabrik</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Masa Kadaluarsa Dijamin Jauh &amp; Kemasan Segel</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                  <Truck className="size-4 text-emerald-600 shrink-0" />
                  <span>Siap Kirim Kurir Instan / Ambil Mandiri di Toko</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Store, Stock, Price & Actions */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title & Store Card */}
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3.5">
              {/* Store Identity */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BadgeCheck className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-neutral-100">
                        {product.outletName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                        Official Store
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-gray-400" />
                      <span>{product.outletLocation}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">SKU / Kode</span>
                  <span className="font-mono text-xs font-bold text-gray-700 dark:text-neutral-300">{product.sku}</span>
                </div>
              </div>

              {/* Title & Rating */}
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-neutral-50 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                  <span className="text-gray-500 dark:text-neutral-400 font-medium">
                    {product.soldCount}+ Transaksi Terjual
                  </span>
                  <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Kategori: {product.category}
                  </span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-bold block">
                    Harga Grosir Resmi
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(product.sellingPrice)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-neutral-400 font-mono font-semibold">
                      /{product.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Status Stok</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                      isOutOfStock
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isOutOfStock ? 'Stok Habis' : `Tersedia: ${activeStock} ${product.unit}`}
                  </span>
                </div>
              </div>

              {/* Multi-Outlet Fulfillment Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-neutral-400 uppercase tracking-wider block">
                  Pilih Cabang Pengambilan / Pemenuhan Stok:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutletFulfillment('toko-1');
                      setBuyQty(1);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedOutletFulfillment === 'toko-1'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-gray-900 dark:text-neutral-100">
                        <Building2 className="size-4 text-emerald-600" />
                        Toko 1 (Pusat &amp; Gudang)
                      </span>
                      {selectedOutletFulfillment === 'toko-1' && <Check className="size-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      Jl. Pemuda No. 12 &bull; Stok: <strong className="font-mono text-emerald-600 font-bold">{product.t1Stock} {product.unit}</strong>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutletFulfillment('toko-2');
                      setBuyQty(1);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedOutletFulfillment === 'toko-2'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-2xs'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-gray-900 dark:text-neutral-100">
                        <Store className="size-4 text-blue-600" />
                        Toko 2 (Cabang Satelit)
                      </span>
                      {selectedOutletFulfillment === 'toko-2' && <Check className="size-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      Jl. Kesambi No. 45 &bull; Stok: <strong className="font-mono text-blue-600 font-bold">{product.t2Stock} {product.unit}</strong>
                    </p>
                  </button>
                </div>
              </div>

              {/* Purchase Box */}
              <div className="p-4 bg-gray-50/80 dark:bg-neutral-800/40 rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    Jumlah Pembelian:
                  </span>
                  <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-gray-200 dark:border-neutral-700">
                    <button
                      type="button"
                      disabled={buyQty <= 1}
                      onClick={() => setBuyQty((prev) => Math.max(1, prev - 1))}
                      className="size-7 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-200 cursor-pointer disabled:opacity-40"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="font-mono font-extrabold text-sm w-8 text-center text-gray-900 dark:text-neutral-50">
                      {buyQty}
                    </span>
                    <button
                      type="button"
                      disabled={buyQty >= activeStock}
                      onClick={() => setBuyQty((prev) => Math.min(activeStock, prev + 1))}
                      className="size-7 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-200 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-neutral-700/60">
                  <span className="text-xs text-gray-500">Subtotal Belanja:</span>
                  <span className="font-mono font-extrabold text-lg text-gray-900 dark:text-neutral-50">
                    {formatRupiah(product.sellingPrice * buyQty)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="py-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:border-gray-900 dark:hover:border-neutral-200 text-gray-900 dark:text-neutral-100 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                    <span>+ Keranjang</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleDirectBuy}
                    className="py-3 bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <ShoppingBag className="size-4" />
                    <span>Beli Sekarang</span>
                  </button>
                </div>

                {addedToast && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{buyQty} {product.unit} berhasil ditambahkan ke keranjang belanja!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specification Matrix */}
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Spesifikasi &amp; Detail Kemasan:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Tipe Kemasan</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100 mt-0.5 block">
                    {product.specification.packaging}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Berat Bersih</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100 mt-0.5 block">
                    {product.specification.weight}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Masa Simpan</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100 mt-0.5 block">
                    {product.specification.shelfLife}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Asal Pabrik / Brand</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100 mt-0.5 block">
                    {product.specification.origin}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Product Description */}
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Deskripsi Lengkap Produk:
              </h3>
              <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-50">
                Produk Sejenis Lainnya ({product.category})
              </h3>
              <Link to="/shop" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  to="/product/$productId"
                  params={{ productId: rel.id }}
                  className="p-3 rounded-2xl border border-gray-200/80 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 transition-all flex items-center gap-3 group"
                >
                  <img
                    src={rel.image || FALLBACK_PRODUCT_IMAGES[rel.id]}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="size-16 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-neutral-700"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 transition-colors">
                      {rel.name}
                    </p>
                    <p className="font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatRupiah(rel.sellingPrice)}
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {rel.outletName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cart & Checkout Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                      Keranjang Belanja
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Total {totalCartCount} item sembako
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
                      onClick={() => cartStore.clearCart()}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer"
                    >
                      Kosongkan Keranjang
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-2.5 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-200/60 dark:border-neutral-800 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image || FALLBACK_PRODUCT_IMAGES[item.productId]}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="size-11 rounded-xl object-cover shrink-0 border border-gray-200/80 dark:border-neutral-700 bg-white"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-neutral-100 truncate text-xs">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {item.outletName}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500 dark:text-neutral-400 block mt-0.5">
                            {formatRupiah(item.price)} &times; {item.qty} ={' '}
                            <strong className="text-gray-900 dark:text-neutral-50 font-bold">
                              {formatRupiah(item.price * item.qty)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => cartStore.updateQty(item.productId, -1)}
                          className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono font-bold text-xs w-5 text-center text-gray-900 dark:text-neutral-50">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.qty >= item.maxStock}
                          onClick={() => cartStore.updateQty(item.productId, 1)}
                          className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cartStore.removeItem(item.productId)}
                          className="size-6 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer ml-1"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <form id="detail-checkout-form" onSubmit={handleCheckout} className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  {/* Fulfillment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Metode Pemenuhan:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('PICKUP')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          fulfillmentType === 'PICKUP'
                            ? 'border-gray-900 dark:border-neutral-100 bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Store className="size-4" />
                        <span>Ambil di Toko (Pickup)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('DELIVERY')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          fulfillmentType === 'DELIVERY'
                            ? 'border-gray-900 dark:border-neutral-100 bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Truck className="size-4" />
                        <span>Kirim Kurir (Delivery)</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Nama Pemesan *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ibu Siti / Bpk Budi"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Nomor WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="08123456789"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {fulfillmentType === 'DELIVERY' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Alamat Lengkap Pengiriman *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-2.5 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                      />
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Metode Pembayaran:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'QRIS'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <QrCode className="size-4" />
                        <span>QRIS Instan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('TRANSFER')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'TRANSFER'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <CreditCard className="size-4" />
                        <span>Transfer Bank</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'CASH'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Banknote className="size-4" />
                        <span>Bayar Tunai</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                      Catatan Pesanan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Beras minta karung yang baru, jangan dibanting..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                    />
                  </div>
                </form>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-500 dark:text-neutral-400">Total Pembayaran</span>
                  <span className="font-mono font-extrabold text-base text-gray-900 dark:text-neutral-50">
                    {formatRupiah(totalCartAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="detail-checkout-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Memproses Pesanan...</span>
                  ) : (
                    <>
                      <span>Konfirmasi Pesanan Sembako</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Order Modal with Direct WhatsApp Routing */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-4 text-center"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-neutral-50">
                  Pesanan Berhasil Dibuat!
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  ID Pesanan:{' '}
                  <strong className="font-mono text-gray-800 dark:text-neutral-200 font-bold">
                    {completedOrder.id}
                  </strong>
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-neutral-800/60 rounded-2xl border border-gray-100 dark:border-neutral-800 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Pemesan:</span>
                  <span className="font-bold text-gray-800 dark:text-neutral-200">
                    {completedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Layanan:</span>
                  <span className="font-bold text-gray-800 dark:text-neutral-200">
                    {completedOrder.fulfillmentType}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200/60 dark:border-neutral-700/60 pt-1.5">
                  <span className="text-gray-400 font-sans">Total Tagihan:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(completedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/6281234567801?text=${encodeURIComponent(
                    `Halo Admin Toko Sembako, saya sudah membuat pesanan dengan ID: *${completedOrder.id}* atas nama *${completedOrder.customerName}* sejumlah *${formatRupiah(
                      completedOrder.totalAmount
                    )}*. Mohon diproses ya. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>Kirim Rincian ke WhatsApp Toko</span>
                </a>

                <Link
                  to="/shop"
                  className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 block text-center cursor-pointer"
                >
                  Kembali ke Etalase Belanja
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
