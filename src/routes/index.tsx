import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Receipt,
  RotateCcw,
  Plus,
  Minus,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { outletStore, OutletId, OUTLET_CONFIG } from '@/lib/outletStore';

export const Route = createFileRoute('/')({
  component: PosPage,
});

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  maxStock: number;
}

function PosPage() {
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = outletStore.subscribe((id) => {
      setActiveOutlet(id);
      setCart([]); // Clear cart when outlet changes to prevent cross-outlet stock corruption
      setLastOrder(null);
      setErrorMessage(null);
    });
    return unsub;
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

  const addToCart = (prod: any) => {
    const available = prod.stock ?? 0;
    if (available <= 0) {
      setErrorMessage(`Stok "${prod.name}" habis di outlet ini.`);
      return;
    }

    setErrorMessage(null);
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
        { productId: prod.id, name: prod.name, price: prod.sellingPrice, qty: 1, maxStock: available },
      ];
    });
  };

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
        setLastOrder(data.order);
        setCart([]);
        setCashReceived(0);
        loadProducts(); // Refresh stock counts immediately
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
    <div className="space-y-4">
      {/* Active Outlet Banner */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold shrink-0">
            <Building2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{currentOutletInfo.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                {currentOutletInfo.type === 'STORE_WAREHOUSE' ? 'Pusat & Gudang' : 'Cabang Satelit'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{currentOutletInfo.address}</span>
          </div>
        </div>

        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
          Stok terisolasi otomatis pada buku kasir {currentOutletInfo.shortName}
        </span>
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
          <div className="relative">
            <Search className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari barang via nama, SKU, atau kategori (beras, minyak, kopi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {products.map((p) => {
              const isOutOfStock = p.stock <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(p)}
                  className={`p-3 bg-white dark:bg-zinc-900 border rounded-xl text-left transition-all shadow-2xs space-y-1.5 cursor-pointer relative ${
                    isOutOfStock
                      ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 cursor-not-allowed'
                      : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono block">{p.sku}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isOutOfStock
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : p.isLow
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {isOutOfStock ? 'Habis' : `Sisa ${p.stock}`}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">{p.name}</h4>

                  <div className="flex items-baseline justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs font-mono tabular-nums">
                      Rp {p.sellingPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-zinc-400">/{p.unit}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Quick Checkout */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">Keranjang Kasir</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono font-bold">{cart.length} SKU</span>
          </div>

          {/* Cart Item List */}
          <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                Keranjang belanja kosong. Klik produk di sebelah kiri untuk menambah.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold block truncate text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Rp {item.price.toLocaleString('id-ID')} &times; {item.qty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, -1)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                        title="Kurangi"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-2 font-mono font-black text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, 1)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                        title="Tambah"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="size-7 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Summary */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs">
            <div className="flex justify-between font-black text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Total Tagihan</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base font-mono tabular-nums">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Quick Cash Buttons */}
            {totalAmount > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-zinc-400 mr-1">Uang Pas / Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleQuickCash(totalAmount)}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                >
                  Uang Pas
                </button>
                {[50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                  >
                    {(amt / 1000)}k
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">
                Uang Tunai Diterima (Rp)
              </label>
              <input
                type="number"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                placeholder={`Contoh: ${totalAmount}`}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {cashReceived > 0 && (
              <div className="flex justify-between text-xs font-bold p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span>Kembalian:</span>
                <span className="tabular-nums font-black font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {change.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs shadow-xs disabled:opacity-40 transition-all cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? 'Memproses Transaksi...' : 'Selesaikan Transaksi & Struk Digital'}
            </button>
          </div>

          {/* Struk Digital Ringkas (Digital Receipt) */}
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
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">{it.productName} x{it.qty}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
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

              <button
                type="button"
                onClick={() => setLastOrder(null)}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>Transaksi Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
