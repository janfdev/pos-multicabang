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
  ShoppingBag,
  ExternalLink,
  Globe,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { outletStore, OutletId, OUTLET_CONFIG } from '@/lib/outletStore';
import { themeStore, ThemeMode } from '@/lib/themeStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [activeOutlet, setActiveOutlet] = useState<OutletId>(outletStore.getOutlet());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(themeStore.getTheme());
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const unsubOutlet = outletStore.subscribe((id) => setActiveOutlet(id));
    const unsubTheme = themeStore.subscribe((t) => setTheme(t));
    return () => {
      unsubOutlet();
      unsubTheme();
    };
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // If customer visits /shop, bypass admin shell completely
  if (currentPath === '/shop' || currentPath.startsWith('/shop/')) {
    return <Outlet />;
  }

  const handleSwitchOutlet = (id: OutletId) => {
    outletStore.setOutlet(id);
  };

  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

  const currentOutletInfo = OUTLET_CONFIG[activeOutlet];

  // Dynamic Breadcrumb Label Mapping
  const getBreadcrumbLabel = () => {
    if (currentPath === '/dashboard') return { pillar: 'Operasional & Analitik', page: 'Dashboard Eksekutif' };
    if (currentPath === '/') return { pillar: 'Operasional Kasir', page: 'Terminal Kasir POS' };
    if (currentPath === '/online-orders') return { pillar: 'Operasional Kasir', page: 'Antrean Pesanan Online' };
    if (currentPath === '/inventory') return { pillar: 'Logistik & Inventaris', page: 'Monitoring Stok Cabang' };
    if (currentPath === '/transfers') return { pillar: 'Logistik & Inventaris', page: 'Mutasi Transfer Stok' };
    return { pillar: 'Operasional', page: 'Halaman Utama' };
  };

  const breadcrumb = getBreadcrumbLabel();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* ─── DESKTOP PERSISTENT SIDEBAR (>= MD) ──────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-zinc-900/90 border-r border-zinc-200/80 dark:border-zinc-800/80 shrink-0 p-4 flex-col justify-between h-screen sticky top-0 overflow-y-auto z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black shadow-xs shrink-0">
                <Store className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                    POS Multi-Cabang
                  </h1>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate">
                  Retail &amp; Omnichannel
                </p>
              </div>
            </div>

            {/* Quick Theme Toggle Icon */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          </div>

          {/* Active Outlet Quick Card in Sidebar */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Cabang Operasional
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <Building2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{currentOutletInfo.shortName}</span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
              {currentOutletInfo.address}
            </span>
          </div>

          {/* Business Pillars Navigation */}
          <nav className="space-y-5 text-xs">
            {/* Pillar 1: Operasional & Kasir */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Operasional Kasir
              </span>

              <Link
                to="/dashboard"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 [&.active]:bg-zinc-900 [&.active]:text-white dark:[&.active]:bg-white dark:[&.active]:text-zinc-900 [&.active]:font-bold [&.active]:shadow-2xs"
              >
                <LayoutDashboard className="size-4 shrink-0" />
                <span>Dashboard Eksekutif</span>
              </Link>

              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 [&.active]:bg-zinc-900 [&.active]:text-white dark:[&.active]:bg-white dark:[&.active]:text-zinc-900 [&.active]:font-bold [&.active]:shadow-2xs"
              >
                <ShoppingCart className="size-4 shrink-0" />
                <span>Terminal Kasir POS</span>
              </Link>

              <Link
                to="/online-orders"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 [&.active]:bg-zinc-900 [&.active]:text-white dark:[&.active]:bg-white dark:[&.active]:text-zinc-900 [&.active]:font-bold [&.active]:shadow-2xs"
              >
                <ShoppingBag className="size-4 shrink-0" />
                <span>Pesanan Online</span>
              </Link>
            </div>

            {/* Pillar 2: Logistik & Inventaris */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Logistik &amp; Distribusi
              </span>

              <Link
                to="/inventory"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 [&.active]:bg-zinc-900 [&.active]:text-white dark:[&.active]:bg-white dark:[&.active]:text-zinc-900 [&.active]:font-bold [&.active]:shadow-2xs"
              >
                <PackageSearch className="size-4 shrink-0" />
                <span>Monitoring Stok</span>
              </Link>

              <Link
                to="/transfers"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 [&.active]:bg-zinc-900 [&.active]:text-white dark:[&.active]:bg-white dark:[&.active]:text-zinc-900 [&.active]:font-bold [&.active]:shadow-2xs"
              >
                <ArrowLeftRight className="size-4 shrink-0" />
                <span>Mutasi Transfer Stok</span>
              </Link>
            </div>

            {/* Pillar 3: Kanal Publik */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Kanal Publik
              </span>

              <Link
                to="/shop"
                target="_blank"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Katalog Toko Online</span>
                </div>
                <ExternalLink className="size-3 text-emerald-600 dark:text-emerald-400" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer / System Telemetry */}
        <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="size-3 text-emerald-500 animate-pulse" />
              <span>Hono Serverless</span>
            </span>
            <span className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              v2.0
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 text-[10px] text-zinc-500 dark:text-zinc-400 space-y-0.5">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Outlet Concurrency</span>
            </p>
            <p>Stok terisolasi otomatis per cabang</p>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE TOPBAR (< MD) ─────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shrink-0">
            <Store className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">POS Multi-Cabang</h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{currentOutletInfo.shortName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="size-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU SLIDEDOWN (< MD) ─────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 space-y-3 z-20 shadow-md">
          {/* Switch Outlet Selector on Mobile */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Pilih Outlet Operasional:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-1')}
                className={`p-2 rounded-xl border text-left font-bold cursor-pointer transition-all ${
                  activeOutlet === 'toko-1'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="block text-xs">Toko 1</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Pusat &amp; Gudang</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-2')}
                className={`p-2 rounded-xl border text-left font-bold cursor-pointer transition-all ${
                  activeOutlet === 'toko-2'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="block text-xs">Toko 2</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Cabang Satelit</span>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard Eksekutif</span>
            </Link>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <ShoppingCart className="size-4" />
              <span>Terminal Kasir POS</span>
            </Link>
            <Link
              to="/online-orders"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <ShoppingBag className="size-4" />
              <span>Pesanan Online</span>
            </Link>
            <Link
              to="/inventory"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <PackageSearch className="size-4" />
              <span>Monitoring Stok</span>
            </Link>
            <Link
              to="/transfers"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <ArrowLeftRight className="size-4" />
              <span>Mutasi Transfer Stok</span>
            </Link>
            <Link
              to="/shop"
              target="_blank"
              className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Katalog Toko Online (/shop)</span>
              </div>
              <ExternalLink className="size-3 text-emerald-600 dark:text-emerald-400" />
            </Link>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Desktop Top Header Bar with Breadcrumb, Outlet Switcher & Theme */}
        <header className="hidden md:flex h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 items-center justify-between sticky top-0 z-10 shadow-2xs transition-colors">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-400 dark:text-zinc-500">POS Core</span>
            <ChevronRight className="size-3 text-zinc-300 dark:text-zinc-600" />
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{breadcrumb.pillar}</span>
            <ChevronRight className="size-3 text-zinc-300 dark:text-zinc-600" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{breadcrumb.page}</span>
          </div>

          {/* Outlet Switcher Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchOutlet('toko-1')}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                  activeOutlet === 'toko-1'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
