import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import {
  Store,
  ShoppingCart,
  ArrowLeftRight,
  PackageSearch,
  Building2,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { outletStore, OutletId, OUTLET_CONFIG } from '@/lib/outletStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const unsub = outletStore.subscribe((id) => setActiveOutlet(id));
    return unsub;
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const handleSwitchOutlet = (id: OutletId) => {
    outletStore.setOutlet(id);
  };

  const currentOutletInfo = OUTLET_CONFIG[activeOutlet];

  // Dynamic Breadcrumb Label Mapping
  const getBreadcrumbLabel = () => {
    if (currentPath === '/dashboard') return { pillar: 'Operasional & Bisnis', page: 'Ringkasan Dashboard' };
    if (currentPath === '/') return { pillar: 'Operasional & Kasir', page: 'Terminal Kasir POS' };
    if (currentPath === '/inventory') return { pillar: 'Logistik & Inventaris', page: 'Monitoring Stok Cabang' };
    if (currentPath === '/transfers') return { pillar: 'Logistik & Inventaris', page: 'Mutasi Transfer Stok' };
    return { pillar: 'Operasional', page: 'Halaman Utama' };
  };

  const breadcrumb = getBreadcrumbLabel();

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col md:flex-row font-sans">
      {/* ─── DESKTOP PERSISTENT SIDEBAR (>= MD) ──────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200/80 shrink-0 p-4 flex-col justify-between h-screen sticky top-0 overflow-y-auto z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="size-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Store className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm leading-tight text-stone-900 truncate">
                POS Multi-Cabang
              </h1>
              <p className="text-[11px] text-stone-400 font-medium truncate">
                Sistem Ritel &amp; Inventaris
              </p>
            </div>
          </div>

          {/* Active Outlet Quick Card in Sidebar */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Outlet Aktif
            </span>
            <div className="flex items-center gap-1.5 font-black text-stone-900">
              <Building2 className="size-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{currentOutletInfo.shortName}</span>
            </div>
            <span className="text-[10px] text-stone-500 block truncate">
              {currentOutletInfo.address}
            </span>
          </div>

          {/* Business Pillars Navigation */}
          <nav className="space-y-5 text-xs">
            {/* Pillar 1: Operasional & Kasir */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Operasional Kasir
              </span>

              <Link
                to="/dashboard"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors text-stone-600 hover:bg-stone-50 hover:text-stone-900 [&.active]:bg-emerald-50 [&.active]:text-emerald-900 [&.active]:shadow-2xs"
              >
                <LayoutDashboard className="size-4 shrink-0 text-emerald-700" />
                <span>Ringkasan Dashboard</span>
              </Link>

              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors text-stone-600 hover:bg-stone-50 hover:text-stone-900 [&.active]:bg-emerald-50 [&.active]:text-emerald-900 [&.active]:shadow-2xs"
              >
                <ShoppingCart className="size-4 shrink-0 text-emerald-700" />
                <span>Kasir Penjualan POS</span>
              </Link>
            </div>

            {/* Pillar 2: Logistik & Inventaris */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Logistik &amp; Inventaris
              </span>

              <Link
                to="/inventory"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors text-stone-600 hover:bg-stone-50 hover:text-stone-900 [&.active]:bg-emerald-50 [&.active]:text-emerald-900 [&.active]:shadow-2xs"
              >
                <PackageSearch className="size-4 shrink-0 text-amber-600" />
                <span>Monitoring Stok</span>
              </Link>

              <Link
                to="/transfers"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors text-stone-600 hover:bg-stone-50 hover:text-stone-900 [&.active]:bg-emerald-50 [&.active]:text-emerald-900 [&.active]:shadow-2xs"
              >
                <ArrowLeftRight className="size-4 shrink-0 text-blue-600" />
                <span>Mutasi Transfer Stok</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer / System Telemetry */}
        <div className="pt-4 border-t border-stone-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="size-3 text-emerald-600 animate-pulse" />
              <span>Hono Serverless</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              v1.0.0
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[10px] text-stone-500 space-y-0.5">
            <p className="font-bold text-stone-700 flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>Multi-Outlet Guard</span>
            </p>
            <p>Stok terisolasi otomatis per cabang</p>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE TOPBAR (< MD) ─────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
            <Store className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs text-stone-900 truncate">POS Multi-Cabang</h1>
            <p className="text-[10px] text-stone-500 truncate">{currentOutletInfo.shortName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="size-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      {/* ─── MOBILE MENU SLIDEDOWN (< MD) ─────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 p-4 space-y-3 z-20 shadow-md">
          {/* Switch Outlet Selector on Mobile */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Pilih Outlet Kasir:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-1')}
                className={`p-2 rounded-xl border text-left font-bold cursor-pointer ${
                  activeOutlet === 'toko-1'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <span className="block text-xs">Toko 1</span>
                <span className="text-[10px] text-stone-500 font-normal">Pusat &amp; Gudang</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-2')}
                className={`p-2 rounded-xl border text-left font-bold cursor-pointer ${
                  activeOutlet === 'toko-2'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <span className="block text-xs">Toko 2</span>
                <span className="text-[10px] text-stone-500 font-normal">Cabang Satelit</span>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1 pt-2 border-t border-stone-100 text-xs font-bold">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <LayoutDashboard className="size-4 text-emerald-700" />
              <span>Ringkasan Dashboard</span>
            </Link>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <ShoppingCart className="size-4 text-emerald-700" />
              <span>Kasir Penjualan POS</span>
            </Link>
            <Link
              to="/inventory"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <PackageSearch className="size-4 text-amber-600" />
              <span>Monitoring Stok</span>
            </Link>
            <Link
              to="/transfers"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              <ArrowLeftRight className="size-4 text-blue-600" />
              <span>Mutasi Transfer Stok</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Desktop Top Header Bar with Breadcrumb and Outlet Switcher */}
        <header className="hidden md:flex h-14 bg-white border-b border-stone-200/80 px-6 items-center justify-between sticky top-0 z-10 shadow-2xs">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="font-semibold text-stone-400">Portal Admin</span>
            <ChevronRight className="size-3 text-stone-300" />
            <span className="font-medium text-stone-500">{breadcrumb.pillar}</span>
            <ChevronRight className="size-3 text-stone-300" />
            <span className="font-bold text-stone-900">{breadcrumb.page}</span>
          </div>

          {/* Outlet Switcher Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400">Outlet Operasional:</span>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
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
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full max-w-7xl mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
