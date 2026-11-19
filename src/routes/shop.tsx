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
} from 'lucide-react';

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
      // Empty cart if outlet changes to prevent cross-outlet confusion
      setCart([]);
    }
  };

  // Cart Actions
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Cannot exceed stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            if (newQty > item.product.stock) return item;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartAmount = cart.reduce(
    (acc, item) => acc + item.product.sellingPrice * item.qty,
    0
  );
  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Mohon isi nama lengkap dan nomor WhatsApp.');
      return;
    }
    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      setCheckoutError('Mohon isi alamat lengkap pengiriman.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

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
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans pb-16">
      {/* ─── PUBLIC TOP HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Store className="size-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-tight text-stone-900">
                Katalog Toko Online
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">
                Pesan mandiri &bull; Ambil di toko atau kirim kurir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-stone-900 font-semibold px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors hidden sm:block"
            >
              Login Staf Kasir &rarr;
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer relative"
            >
              <ShoppingBag className="size-4 text-emerald-400" />
              <span>Keranjang</span>
              {totalCartCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Branch Selector Bar */}
        <div className="bg-emerald-50/80 border-t border-emerald-100/80 px-4 py-2">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
              <MapPin className="size-3.5 text-emerald-700 shrink-0" />
              <span>Lokasi Cabang Pengambilan / Pengiriman:</span>
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedOutlet === b.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
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
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Cabang Pemenuhan Aktif:
            </span>
            <h2 className="text-base font-extrabold text-stone-900 mt-0.5">
              {outletInfo.name}
            </h2>
            <p className="text-stone-500 mt-0.5">{outletInfo.address}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-[11px] space-y-0.5">
            <span className="font-bold text-stone-800 block">Stok Real-Time</span>
            <span>Ketersediaan barang di bawah disesuaikan khusus stok cabang ini.</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari beras, minyak, kecap, atau produk lainnya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-2xs"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-50'
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
          <div className="p-16 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            Memuat katalog produk cabang...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
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
                  className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between gap-3 transition-shadow hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isAvailable ? `Tersedia: ${p.stock} ${p.unit}` : 'Habis di Cabang Ini'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-stone-900 mt-2 line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="font-mono text-[11px] text-stone-400 mt-0.5">
                      SKU: {p.sku} &bull; Satuan: {p.unit}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Harga</span>
                      <span className="font-mono font-black text-sm text-emerald-800 block">
                        {formatRupiah(p.sellingPrice)}
                      </span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, -1)}
                          className="size-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono font-black text-xs px-2 text-stone-900">
                          {inCart.qty}
                        </span>
                        <button
                          type="button"
                          disabled={inCart.qty >= p.stock}
                          onClick={() => updateCartQty(p.id, 1)}
                          className="size-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => addToCart(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="w-full bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer border border-stone-700 transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2.5 text-xs text-left">
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                {totalCartCount}
              </div>
              <div>
                <span className="font-bold block">{totalCartCount} Barang di Keranjang</span>
                <span className="text-[11px] text-stone-400">Siap untuk checkout</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-emerald-400">
                {formatRupiah(totalCartAmount)}
              </span>
              <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      )}

      {/* ─── CART & CHECKOUT MODAL DRAWER ───────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">Keranjang Belanja</h3>
                  <p className="text-[11px] text-stone-500">Cabang: {outletInfo.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="size-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2 text-xs">
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Daftar Barang:
                </span>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 truncate">{item.product.name}</h4>
                      <span className="font-mono text-[11px] text-stone-500 block">
                        {formatRupiah(item.product.sellingPrice)} &times; {item.qty} ={' '}
                        <strong className="text-emerald-800 font-bold">
                          {formatRupiah(item.product.sellingPrice * item.qty)}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="size-6 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-700 font-bold"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold text-xs w-5 text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        disabled={item.qty >= item.product.stock}
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="size-6 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-700 font-bold disabled:opacity-30"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="size-6 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfillment Option */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Metode Pemenuhan:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('PICKUP')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      fulfillmentType === 'PICKUP'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="block font-bold text-xs">Ambil Sendiri di Toko</span>
                    <span className="block text-[10px] text-stone-500">Gratis &bull; Ambil di kasir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('DELIVERY')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      fulfillmentType === 'DELIVERY'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <span className="block font-bold text-xs">Kirim Kurir Lokal</span>
                    <span className="block text-[10px] text-stone-500">Dikirim langsung ke rumah</span>
                  </button>
                </div>
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-stone-100">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Nama Lengkap Pemesan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rina Susanti"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                {fulfillmentType === 'DELIVERY' && (
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">Alamat Lengkap Pengiriman *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Catatan Pesanan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jangan dibanting / Telepon jika sudah di depan pagar"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 block">Total Tagihan:</span>
                <span className="font-mono font-black text-base text-emerald-900 block">
                  {formatRupiah(totalCartAmount)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || cart.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim Pesanan...' : 'Pesan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDER COMPLETED SUCCESS MODAL ──────────────────────────────────── */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Status: Menunggu Konfirmasi Toko
              </span>
              <h3 className="font-black text-lg text-stone-900 mt-2">Pesanan Berhasil Dibuat!</h3>
              <p className="font-mono text-xs text-stone-500 mt-0.5 font-bold">
                ID Pesanan: {completedOrder.id}
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl text-left text-xs border border-stone-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Cabang:</span>
                <span className="font-bold text-stone-800">{outletInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pemesan:</span>
                <span className="font-bold text-stone-800">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Metode:</span>
                <span className="font-bold text-stone-800">
                  {completedOrder.fulfillmentType === 'PICKUP' ? 'Ambil di Toko' : 'Kirim Kurir'}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-1.5">
                <span className="font-bold text-stone-700">Total Pembayaran:</span>
                <span className="font-mono font-black text-sm text-emerald-800">
                  {formatRupiah(completedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              Silakan konfirmasi pesanan Anda melalui WhatsApp ke staf toko kami agar pesanan segera disiapkan.
            </p>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${outletInfo.wa}?text=${encodeURIComponent(
                  `Halo ${outletInfo.name}, saya ingin konfirmasi pesanan online dengan ID: *${completedOrder.id}* atas nama *${completedOrder.customerName}* senilai ${formatRupiah(completedOrder.totalAmount)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="size-4" />
                <span>Konfirmasi via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
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
