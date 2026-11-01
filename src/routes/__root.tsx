import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Store, ShoppingCart, ArrowLeftRight, PackageSearch, Building2, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { outletStore, OutletId } from '@/lib/outletStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());

  useEffect(() => {
    const unsub = outletStore.subscribe((id) => setActiveOutlet(id));
    return unsub;
  }, []);

  const handleSwitchOutlet = (id: OutletId) => {
    outletStore.setOutlet(id);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-xs">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight text-stone-900">POS Multi-Cabang</h1>
            <p className="text-[11px] text-stone-500 font-medium">Inventory &amp; Kasir Terintegrasi</p>
          </div>
        </div>

        {/* Outlet Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
          <span className="text-[10px] font-bold text-stone-400 pl-2 hidden sm:inline">Outlet Kasir:</span>
          <button
            type="button"
            onClick={() => handleSwitchOutlet('toko-1')}
            className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              activeOutlet === 'toko-1'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Toko 1 (Gudang)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchOutlet('toko-2')}
            className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              activeOutlet === 'toko-2'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Toko 2 (Cabang)</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-stone-200 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <Link
          to="/dashboard"
          className="py-3 px-3.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors [&.active]:border-emerald-700 [&.active]:text-emerald-800 text-stone-500 hover:text-stone-900 border-transparent"
        >
          <LayoutDashboard className="size-4" />
          <span>Ringkasan Dashboard</span>
        </Link>
        <Link
          to="/"
          className="py-3 px-3.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors [&.active]:border-emerald-700 [&.active]:text-emerald-800 text-stone-500 hover:text-stone-900 border-transparent"
        >
          <ShoppingCart className="size-4" />
          <span>Kasir POS</span>
        </Link>
        <Link
          to="/inventory"
          className="py-3 px-3.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors [&.active]:border-emerald-700 [&.active]:text-emerald-800 text-stone-500 hover:text-stone-900 border-transparent"
        >
          <PackageSearch className="size-4" />
          <span>Monitoring Stok</span>
        </Link>
        <Link
          to="/transfers"
          className="py-3 px-3.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors [&.active]:border-emerald-700 [&.active]:text-emerald-800 text-stone-500 hover:text-stone-900 border-transparent"
        >
          <ArrowLeftRight className="size-4" />
          <span>Mutasi Barang</span>
        </Link>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
