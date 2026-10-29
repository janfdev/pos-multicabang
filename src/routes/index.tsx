import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: PosPage,
});

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/products?q=${search}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {});
  }, [search]);

  const addToCart = (prod: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === prod.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId: prod.id, name: prod.name, price: prod.sellingPrice, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const change = Math.max(0, cashReceived - totalAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-2',
          items: cart,
          paymentMethod: 'CASH',
          cashReceived: cashReceived || totalAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastOrder(data.order);
        setCart([]);
        setCashReceived(0);
      }
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left: Product Catalog & Search */}
      <div className="lg:col-span-7 space-y-3">
        <div className="relative">
          <Search className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama barang atau barcode (misal: beras, minyak)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addToCart(p)}
              className="p-3 bg-white border border-stone-200 rounded-xl text-left hover:border-emerald-700 transition-colors shadow-2xs space-y-1"
            >
              <span className="text-[10px] text-stone-400 font-mono block">{p.sku}</span>
              <h4 className="font-bold text-xs line-clamp-1">{p.name}</h4>
              <span className="font-black text-emerald-700 text-xs block tabular-nums">
                Rp {p.sellingPrice.toLocaleString('id-ID')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Quick Checkout */}
      <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs">Keranjang Penjualan</h3>
          </div>
          <span className="text-xs text-stone-400 font-bold">{cart.length} item</span>
        </div>

        {/* Cart Item List */}
        <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">Belum ada item dipilih</div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                <div className="min-w-0 pr-2">
                  <span className="font-bold block truncate">{item.name}</span>
                  <span className="text-[10px] text-stone-500">
                    {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black tabular-nums">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="size-6 text-stone-400 hover:text-red-600 flex items-center justify-center"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Summary */}
        <div className="pt-2 border-t border-stone-200 space-y-2 text-xs">
          <div className="flex justify-between font-black text-sm">
            <span>Total Tagihan</span>
            <span className="text-emerald-700 tabular-nums">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold text-stone-500 block">Uang Diterima (Tunai)</label>
            <input
              type="number"
              value={cashReceived || ''}
              onChange={(e) => setCashReceived(Number(e.target.value))}
              placeholder="Jumlah tunai..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-bold tabular-nums"
            />
          </div>

          {cashReceived > 0 && (
            <div className="flex justify-between text-xs font-bold pt-1 text-stone-600">
              <span>Kembalian</span>
              <span className="tabular-nums">Rp {change.toLocaleString('id-ID')}</span>
            </div>
          )}

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs disabled:opacity-50 transition-colors mt-2"
          >
            Selesaikan Transaksi (Cetak Struk)
          </button>
        </div>

        {/* Success Modal Notification */}
        {lastOrder && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="size-4" />
              <span>Transaksi Berhasil Disimpan!</span>
            </div>
            <p className="text-[11px] text-emerald-700">Order ID: {lastOrder.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
