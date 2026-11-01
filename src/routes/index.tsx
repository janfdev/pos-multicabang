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
      <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Building2 className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-900">{currentOutletInfo.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {currentOutletInfo.type === 'STORE_WAREHOUSE' ? 'Pusat & Gudang' : 'Cabang Satelit'}
              </span>
            </div>
            <span className="text-[11px] text-stone-500">{currentOutletInfo.address}</span>
          </div>
        </div>

        <span className="text-[11px] text-stone-400 font-semibold">
          Stok otomatis dikurangi dari buku inventaris {currentOutletInfo.shortName}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center gap-2 text-rose-800 font-bold">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Product Catalog & Search */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang, SKU, atau kategori (misal: beras, minyak)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
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
                  className={`p-3 bg-white border rounded-xl text-left transition-all shadow-2xs space-y-1.5 cursor-pointer relative ${
                    isOutOfStock
                      ? 'opacity-50 border-stone-200 bg-stone-50 cursor-not-allowed'
                      : 'border-stone-200 hover:border-emerald-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono block">{p.sku}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700'
                          : p.isLow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isOutOfStock ? 'Habis' : `Sisa ${p.stock}`}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{p.name}</h4>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-black text-emerald-700 text-xs tabular-nums">
                      Rp {p.sellingPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-stone-400">/{p.unit}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Quick Checkout */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-emerald-700" />
              <h3 className="font-extrabold text-xs">Keranjang Penjualan</h3>
            </div>
            <span className="text-xs text-stone-400 font-bold">{cart.length} SKU</span>
          </div>

          {/* Cart Item List */}
          <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-stone-400 text-xs">
                Keranjang belanja masih kosong. Klik barang di sebelah kiri untuk menambah.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold block truncate text-stone-800">{item.name}</span>
                    <span className="text-[10px] text-stone-500">
                      Rp {item.price.toLocaleString('id-ID')} / unit
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, -1)}
                        className="p-1 hover:bg-stone-100 text-stone-600"
                        title="Kurangi"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-2 font-mono font-black text-xs tabular-nums">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600"
                        title="Tambah"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="size-7 text-stone-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
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
          <div className="pt-2 border-t border-stone-200 space-y-2.5 text-xs">
            <div className="flex justify-between font-black text-sm">
              <span className="text-stone-700">Total Tagihan</span>
              <span className="text-emerald-700 text-base tabular-nums">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-500 block">Uang Tunai Diterima</label>
              <input
                type="number"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                placeholder={`Contoh: ${totalAmount}`}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {cashReceived > 0 && (
              <div className="flex justify-between text-xs font-bold pt-1 text-stone-700 bg-stone-50 p-2 rounded-lg">
                <span>Kembalian:</span>
                <span className="tabular-nums font-black text-emerald-700">
                  Rp {change.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Memproses Transaksi...' : 'Selesaikan Transaksi (Cetak Struk Digital)'}
            </button>
          </div>

          {/* Struk Digital Ringkas (Digital Receipt) */}
          {lastOrder && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-1.5 font-black text-emerald-900">
                  <Receipt className="size-4 text-emerald-700" />
                  <span>Struk Digital Kasir</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">{lastOrder.id}</span>
              </div>

              <div className="text-[11px] text-emerald-800 space-y-0.5">
                <p className="font-bold">{lastOrder.outletName}</p>
                <p className="text-[10px] text-emerald-600 font-mono">
                  {new Date(lastOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-1 py-1 text-[11px]">
                {lastOrder.items.map((it: any) => (
                  <div key={it.productId} className="flex justify-between">
                    <span className="text-emerald-950 font-medium">{it.productName} x{it.qty}</span>
                    <span className="font-mono font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-200 pt-1.5 flex justify-between font-black text-xs text-emerald-950">
                <span>Total:</span>
                <span>Rp {lastOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>Tunai: Rp {lastOrder.cashReceived.toLocaleString('id-ID')}</span>
                <span>Kembalian: Rp {lastOrder.cashChange.toLocaleString('id-ID')}</span>
              </div>

              <button
                type="button"
                onClick={() => setLastOrder(null)}
                className="w-full mt-2 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Transaksi Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
