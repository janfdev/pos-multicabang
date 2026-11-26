"use client";

import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Building2,
  Store,
  LayoutGrid,
  Boxes,
  ArrowLeftRight,
  Truck,
  ShoppingBag,
  Receipt,
  BarChart3,
  ArrowUpRight,
  Search,
  X,
  MapPin,
  ChevronsUpDown,
  Check,
  LogOut,
  Crown,
} from "lucide-react";
import { authStore, UserProfile, DEMO_ACCOUNTS, DemoAccount } from "@/lib/authStore";
import { OUTLET_CONFIG, outletStore } from "@/lib/outletStore";
import { useOnlineOrderAlerts } from "@/lib/useOnlineOrderAlerts";

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

export type NavItem = {
  label: string;
  path: string;
  search?: Record<string, string>;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
};

export function getSidebarConfig(user: UserProfile | null) {
  if (user?.outletId === "toko-1") {
    const info = OUTLET_CONFIG["toko-1"];
    return {
      outletId: "toko-1" as const,
      storeName: info.name,
      storeTag: "TOKO 1 — PUSAT & GUDANG",
      storeIcon: Building2,
      storeAddress: info.address,
      roleTitle: user.roleLabel,
      accent: "blue" as const,
      accentStripe: "from-blue-600 via-indigo-500 to-cyan-400",
      badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
      storeBadgeColor: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40",
      dashboardSectionLabel: "Operasional Toko 1",
      dashboardMenu: [
        { label: "Dashboard Toko 1", path: "/dashboard", search: { outlet: "toko-1" }, icon: Building2 },
      ] as NavItem[],
      mainMenu: [
        { label: "Stok Gudang & Opname", path: "/inventory", icon: Boxes },
        { label: "Mutasi & Kirim ke T2", path: "/transfers", icon: ArrowLeftRight },
        { label: "Live Tracking Armada", path: "/tracking", icon: Truck, badge: "Live" },
        { label: "Pesanan Online T1", path: "/online-orders", icon: ShoppingBag },
        { label: "Kasir POS Toko 1", path: "/pos", icon: Receipt },
      ] as NavItem[],
      toolsMenu: [
        { label: "Laporan Penjualan T1", path: "/reports", icon: BarChart3 },
      ] as NavItem[],
    };
  }

  if (user?.outletId === "toko-2") {
    const info = OUTLET_CONFIG["toko-2"];
    return {
      outletId: "toko-2" as const,
      storeName: info.name,
      storeTag: "TOKO 2 — CABANG SATELIT",
      storeIcon: Store,
      storeAddress: info.address,
      roleTitle: user.roleLabel,
      accent: "emerald" as const,
      accentStripe: "from-emerald-500 via-teal-500 to-green-400",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
      storeBadgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
      dashboardSectionLabel: "Operasional Toko 2",
      dashboardMenu: [
        { label: "Dashboard Toko 2", path: "/dashboard", search: { outlet: "toko-2" }, icon: Store },
      ] as NavItem[],
      mainMenu: [
        { label: "Stok Rak & Opname", path: "/inventory", icon: Boxes },
        { label: "Permintaan Pasokan", path: "/transfers", icon: ArrowLeftRight },
        { label: "Live Tracking Masuk", path: "/tracking", icon: Truck, badge: "Live" },
        { label: "Pesanan Online T2", path: "/online-orders", icon: ShoppingBag },
        { label: "Kasir POS Toko 2", path: "/pos", icon: Receipt },
      ] as NavItem[],
      toolsMenu: [
        { label: "Laporan Penjualan T2", path: "/reports", icon: BarChart3 },
      ] as NavItem[],
    };
  }

  // Owner / Super Admin — Dedicated per-store dashboards + consolidated HQ
  return {
    outletId: "all" as const,
    storeName: "Konsolidasi Multi-Cabang",
    storeTag: "PEMILIK / HQ",
    storeIcon: Crown,
    storeAddress: "Toko 1 (Pemuda) & Toko 2 (Kesambi)",
    roleTitle: user?.roleLabel || "Pemilik / Super Admin",
    accent: "purple" as const,
    accentStripe: "from-purple-600 via-violet-500 to-pink-500",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    storeBadgeColor: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40",
    dashboardSectionLabel: "Dashboard per Cabang",
    dashboardMenu: [
      { label: "Dashboard HQ (Semua)", path: "/dashboard", search: { outlet: "hq" }, icon: LayoutGrid },
      { label: "Dashboard Toko 1", path: "/dashboard", search: { outlet: "toko-1" }, icon: Building2 },
      { label: "Dashboard Toko 2", path: "/dashboard", search: { outlet: "toko-2" }, icon: Store },
    ] as NavItem[],
    mainMenu: [
      { label: "Produk & Stok Cabang", path: "/inventory", icon: Boxes },
      { label: "Mutasi Antar-Cabang", path: "/transfers", icon: ArrowLeftRight },
      { label: "Live Tracking Pengiriman", path: "/tracking", icon: Truck, badge: "Live" },
      { label: "Antrean Pesanan Online", path: "/online-orders", icon: ShoppingBag },
      { label: "Terminal Kasir POS", path: "/pos", icon: Receipt },
    ] as NavItem[],
    toolsMenu: [
      { label: "Analitik & Laba Rugi", path: "/reports", icon: BarChart3 },
    ] as NavItem[],
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
      {children}
    </p>
  );
}

function getNavStyles(accent: "blue" | "emerald" | "purple") {
  if (accent === "blue") {
    return {
      activeClass:
        "bg-blue-50/90 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100 border border-blue-200/60 dark:border-blue-800/40 font-bold shadow-2xs",
      activeIcon: "text-blue-600 dark:text-blue-400",
      activeBar: "bg-blue-600 dark:bg-blue-400",
      hoverClass:
        "text-gray-600 hover:bg-blue-50/60 hover:text-blue-800 dark:text-neutral-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-200",
      hoverIcon: "text-gray-400 group-hover:text-blue-600 dark:text-neutral-500 dark:group-hover:text-blue-400",
      badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
    };
  }
  if (accent === "emerald") {
    return {
      activeClass:
        "bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100 border border-emerald-200/60 dark:border-emerald-800/40 font-bold shadow-2xs",
      activeIcon: "text-emerald-600 dark:text-emerald-400",
      activeBar: "bg-emerald-500 dark:bg-emerald-400",
      hoverClass:
        "text-gray-600 hover:bg-emerald-50/60 hover:text-emerald-800 dark:text-neutral-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200",
      hoverIcon: "text-gray-400 group-hover:text-emerald-600 dark:text-neutral-500 dark:group-hover:text-emerald-400",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    };
  }
  return {
    activeClass:
      "bg-purple-50/90 text-purple-900 dark:bg-purple-950/50 dark:text-purple-100 border border-purple-200/60 dark:border-purple-800/40 font-bold shadow-2xs",
    activeIcon: "text-purple-600 dark:text-purple-400",
    activeBar: "bg-purple-600 dark:bg-purple-400",
    hoverClass:
      "text-gray-600 hover:bg-purple-50/60 hover:text-purple-800 dark:text-neutral-400 dark:hover:bg-purple-950/30 dark:hover:text-purple-200",
    hoverIcon: "text-gray-400 group-hover:text-purple-600 dark:text-neutral-500 dark:group-hover:text-purple-400",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
  };
}

export function Sidebar({
  currentUser,
  onNotify,
}: {
  currentUser: UserProfile | null;
  onNotify?: (msg: string) => void;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const currentOutletParam = (location.search as Record<string, string>)?.outlet;
  const [search, setSearch] = useState("");
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = useState(false);

  const config = getSidebarConfig(currentUser);
  const navStyles = getNavStyles(config.accent);
  const alertScope =
    currentUser?.outletId === "toko-1" || currentUser?.outletId === "toko-2"
      ? currentUser.outletId
      : "ALL";
  const { pendingCount } = useOnlineOrderAlerts(alertScope);

  const handleSwitchUser = (acc: DemoAccount) => {
    authStore.loginWithDemo(acc);
    if (acc.user.outletId === "toko-1" || acc.user.outletId === "toko-2") {
      outletStore.setOutlet(acc.user.outletId);
    }
    onNotify?.(`Beralih akun: ${acc.label} (${acc.user.roleLabel})`);
  };

  const filterBySearch = (items: NavItem[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  };

  const isNavItemActive = (item: NavItem) => {
    if (pathname !== item.path) return false;
    if (item.path === "/dashboard" && item.search?.outlet) {
      if (!currentOutletParam) {
        return (
          (config.outletId === "all" && item.search.outlet === "hq") ||
          config.outletId === item.search.outlet
        );
      }
      return currentOutletParam === item.search.outlet;
    }
    return true;
  };

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isNavItemActive(item);

    return (
      <Link
        key={item.label + (item.search?.outlet || "")}
        to={item.path}
        search={item.search as any}
        onClick={() => {
          if (item.search?.outlet === "toko-1" || item.search?.outlet === "toko-2") {
            outletStore.setOutlet(item.search.outlet);
          }
        }}
        className={`group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
          isActive ? navStyles.activeClass : navStyles.hoverClass
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-active-bar"
            className={`absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full ${navStyles.activeBar}`}
          />
        )}
        <Icon
          size={15}
          className={`transition-colors duration-150 shrink-0 ${
            isActive ? navStyles.activeIcon : navStyles.hoverIcon
          }`}
        />
        <span className="flex-1 text-left tracking-tight group-hover:translate-x-0.5 transition-transform duration-150 truncate">
          {item.label}
        </span>
        {item.path === "/online-orders" && pendingCount > 0 ? (
          <span className="rounded-full px-2 py-0.2 text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse shrink-0">
            {pendingCount} Baru
          </span>
        ) : item.badge ? (
          <span className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${navStyles.badgeColor} shrink-0`}>
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  const filteredDashboards = filterBySearch(config.dashboardMenu);
  const filteredMain = filterBySearch(config.mainMenu);
  const filteredTools = filterBySearch(config.toolsMenu);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full w-64 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-neutral-800 dark:bg-black"
    >
      {/* Brand Header & Active Branch Identity */}
      <div className="p-3.5 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl px-1.5 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 shadow-xs overflow-hidden border border-gray-800">
            <img src="/brand-logo.svg" alt="POS Sembako Logo" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-neutral-50">
              POS Sembako
            </p>
            <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400">
              {config.roleTitle}
            </p>
          </div>
        </div>

        {/* Dedicated Store Identity Card */}
        <div className="mt-2.5 rounded-xl border border-gray-200/80 bg-gray-50/70 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-2xs">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.storeBadgeColor}`}>
            <config.storeIcon size={11} className="shrink-0" />
            {config.storeTag}
          </span>
          <p className="mt-1 text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">
            {config.storeName}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="shrink-0 text-gray-400" />
            {config.storeAddress}
          </p>
        </div>
      </div>

      {/* Functional Menu Filter Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            aria-label="Cari menu navigasi"
            className="w-full rounded-lg bg-gray-100 py-1.5 pl-8 pr-7 text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <motion.nav
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        {filteredDashboards.length > 0 && (
          <>
            <SectionLabel>{config.dashboardSectionLabel}</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {filteredDashboards.map(renderNavLink)}
            </div>
          </>
        )}

        {filteredMain.length > 0 && (
          <>
            <SectionLabel>Menu Operasional</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {filteredMain.map(renderNavLink)}
            </div>
          </>
        )}

        {filteredTools.length > 0 && (
          <>
            <SectionLabel>Analitik &amp; Laporan</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {filteredTools.map(renderNavLink)}
            </div>
          </>
        )}

        {!search && (
          <>
            <SectionLabel>Katalog Publik</SectionLabel>
            <Link
              to="/shop"
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${navStyles.hoverClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Store size={15} className={`transition-colors duration-150 shrink-0 ${navStyles.hoverIcon}`} />
                <span className="truncate tracking-tight group-hover:translate-x-0.5 transition-transform duration-150">
                  Buka Toko Online (/shop)
                </span>
              </div>
              <ArrowUpRight size={13} className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-neutral-200 shrink-0" />
            </Link>
          </>
        )}
      </motion.nav>

      {/* User Account & Role Switcher Widget */}
      <div className="border-t border-gray-100 p-3 dark:border-neutral-800 relative bg-gray-50/50 dark:bg-neutral-900/40">
        <button
          type="button"
          onClick={() => setIsRoleSwitchOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-white dark:hover:bg-neutral-800 transition-all text-left cursor-pointer border border-gray-200/60 dark:border-neutral-800 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar || DEMO_ACCOUNTS[0].user.avatar}
              alt={currentUser?.name || "User"}
              className="size-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-neutral-700"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">
                {currentUser?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">
                {currentUser?.roleLabel || "Owner Multi-Cabang"}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={14} className="text-gray-400 shrink-0" />
        </button>

        {/* Role Switcher Popover */}
        <AnimatePresence>
          {isRoleSwitchOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 shadow-2xl p-2 z-50 space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ganti Hak Akses / Role:
              </div>
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = currentUser?.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      handleSwitchUser(acc);
                      setIsRoleSwitchOpen(false);
                    }}
                    className={`flex w-full items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-gray-100 dark:bg-neutral-800 font-bold text-gray-900 dark:text-neutral-50"
                        : "hover:bg-gray-50 dark:hover:bg-neutral-800/60 text-gray-600 dark:text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={acc.user.avatar} className="size-6 rounded-full object-cover shrink-0" alt={acc.label} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{acc.label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{acc.user.roleLabel}</p>
                      </div>
                    </div>
                    {isCurrent && <Check size={14} className="text-emerald-500 shrink-0" />}
                  </button>
                );
              })}

              <div className="pt-1 border-t border-gray-100 dark:border-neutral-800">
                <Link
                  to="/login"
                  className="flex w-full items-center gap-2 p-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Keluar ke Halaman Login</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
