"use client";

import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Building2,
  Store,
  LayoutGrid,
  Package,
  Boxes,
  ArrowLeftRight,
  Truck,
  ShoppingBag,
  Receipt,
  BarChart3,
  ShieldCheck,
  HelpCircle,
  Settings,
  ShoppingCart,
  ArrowUpRight,
  Search,
  X,
  MapPin,
  ChevronsUpDown,
  Check,
  LogOut,
} from "lucide-react";
import { authStore, UserProfile, DEMO_ACCOUNTS, DemoAccount } from "@/lib/authStore";

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
};

export function getSidebarConfig(user: UserProfile | null) {
  if (user?.outletId === "toko-1") {
    return {
      outletId: "toko-1" as const,
      storeName: "Toko 1 (Pusat & Gudang)",
      storeTag: "🏢 PUSAT & GUDANG UTAMA",
      storeAddress: "Jl. Pemuda No. 12 • Hub Pasokan",
      roleTitle: "Kasir & Kepala Gudang Toko 1",
      accent: "blue" as const,
      accentStripe: "from-blue-600 via-indigo-500 to-cyan-400",
      badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
      storeBadgeColor: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40",
      mainMenu: [
        { label: "Dashboard", path: "/dashboard", icon: Building2 },
        { label: "Stok Gudang", path: "/inventory", icon: Boxes },
        { label: "Mutasi Stok", path: "/transfers", icon: ArrowLeftRight },
        { label: "Live Tracking Pengiriman", path: "/tracking", icon: Truck, badge: "Live" },
        { label: "Pesanan Online", path: "/online-orders", icon: ShoppingBag },
        { label: "Transaksi Kasir POS", path: "/pos", icon: Receipt },
      ],
      toolsMenu: [
        { label: "Laporan Penjualan", path: "/reports", icon: BarChart3 },
      ],
      bottomMenu: [
        { label: "SOP & Panduan Shift", path: "/dashboard", icon: HelpCircle },
      ],
    };
  }

  if (user?.outletId === "toko-2") {
    return {
      outletId: "toko-2" as const,
      storeName: "Toko 2 (Cabang Satelit)",
      storeTag: "🏪 CABANG RETAIL SATELIT",
      storeAddress: "Jl. Kesambi No. 45 • Kasir Frontline",
      roleTitle: "Kasir Frontline Toko 2",
      accent: "emerald" as const,
      accentStripe: "from-emerald-500 via-teal-500 to-green-400",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
      storeBadgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
      mainMenu: [
        { label: "Dashboard", path: "/dashboard", icon: Store },
        { label: "Stok Rak Display", path: "/inventory", icon: Boxes },
        { label: "Permintaan Pasokan", path: "/transfers", icon: ArrowLeftRight },
        { label: "Live Tracking Pengiriman", path: "/tracking", icon: Truck, badge: "Live" },
        { label: "Pesanan Online", path: "/online-orders", icon: ShoppingBag },
        { label: "Transaksi Kasir POS", path: "/pos", icon: Receipt },
      ],
      toolsMenu: [
        { label: "Laporan Penjualan", path: "/reports", icon: BarChart3 },
      ],
      bottomMenu: [
        { label: "SOP & Panduan Shift", path: "/dashboard", icon: HelpCircle },
      ],
    };
  }

  // Super Admin / Owner (Default)
  return {
    outletId: "all" as const,
    storeName: "Konsolidasi Semua Cabang",
    storeTag: "👑 KONSOLIDASI MULTI-CABANG (HQ)",
    storeAddress: "Master Headquarters • Neon Postgres",
    roleTitle: "Super Admin (Semua Cabang)",
    accent: "purple" as const,
    accentStripe: "from-purple-600 via-violet-500 to-pink-500",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    storeBadgeColor: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40",
    mainMenu: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
      { label: "Master Produk & Harga", path: "/inventory", icon: Package },
      { label: "Monitoring Stok Cabang", path: "/inventory", icon: Boxes },
      { label: "Mutasi Antar-Cabang", path: "/transfers", icon: ArrowLeftRight },
      { label: "Live Tracking Pengiriman", path: "/tracking", icon: Truck, badge: "Live" },
      { label: "Antrean Pesanan Online", path: "/online-orders", icon: ShoppingBag },
      { label: "Transaksi Kasir POS", path: "/pos", icon: Receipt },
    ],
    toolsMenu: [
      { label: "Analitik & Laporan", path: "/reports", icon: BarChart3 },
      { label: "Log Audit & Cloud", path: "/dashboard", icon: ShieldCheck },
    ],
    bottomMenu: [
      { label: "SOP & Panduan Shift", path: "/dashboard", icon: HelpCircle },
      { label: "Pengaturan Multi-Outlet", path: "/dashboard", icon: Settings },
    ],
  };
}

const WORKSPACES = [
  { label: "Toko 1 (Pusat & Gudang)", count: 797, color: "bg-blue-600 dark:bg-blue-400", outletId: "toko-1" },
  { label: "Toko 2 (Cabang Satelit)", count: 126, color: "bg-emerald-600 dark:bg-emerald-400", outletId: "toko-2" },
  { label: "Konsolidasi Semua Cabang", count: 923, color: "bg-purple-600 dark:bg-purple-400", outletId: "all" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
      {children}
    </p>
  );
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
  const [search, setSearch] = useState("");
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = useState(false);

  const config = getSidebarConfig(currentUser);

  const handleSwitchUser = (acc: DemoAccount) => {
    authStore.loginWithDemo(acc);
    onNotify?.(`Beralih akun: ${acc.label} (${acc.user.roleLabel})`);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex h-full w-64 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-neutral-800 dark:bg-black"
    >
      {/* Brand Header & Active Branch Card */}
      <div className="p-3.5 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl px-1.5 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 shadow-xs overflow-hidden border border-gray-800">
            <img src="/brand-logo.svg" alt="POS Logo" className="h-full w-full object-contain" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-neutral-50">
                POS Sembako
              </p>
              <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                BagUI
              </span>
            </div>
            <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400">
              {config.roleTitle}
            </p>
          </div>
        </div>

        {/* Dedicated Store Identity Box */}
        <div className="mt-2.5 rounded-xl border border-gray-200/80 bg-gray-50/70 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.storeBadgeColor}`}>
              {config.storeTag}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">
            {config.storeName}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="shrink-0 text-gray-400" />
            {config.storeAddress}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg bg-gray-100 py-1.5 pl-8 pr-9 text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.2 text-[9px] font-medium text-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
              ⌘K
            </span>
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
        <SectionLabel>Menu Operasional</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {config.mainMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.label + item.path}
                to={item.path}
                className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bar"
                    className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gray-900 dark:bg-neutral-50"
                  />
                )}
                <Icon
                  size={15}
                  className={
                    isActive
                      ? "text-gray-900 dark:text-neutral-50"
                      : "text-gray-400 dark:text-neutral-500"
                  }
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {config.toolsMenu.length > 0 && (
          <>
            <SectionLabel>Analitik &amp; Laporan</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {config.toolsMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={
                        isActive
                          ? "text-gray-900 dark:text-neutral-50"
                          : "text-gray-400 dark:text-neutral-500"
                      }
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <SectionLabel>Akses Cepat Operasional</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <Link
            to="/pos"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <ShoppingCart size={15} className="text-gray-400 dark:text-neutral-500" />
            <span className="flex-1 text-left">Terminal Kasir POS</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </Link>
          <Link
            to="/shop"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Store size={15} className="text-gray-400 dark:text-neutral-500" />
              <span>Toko Online (/shop)</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </Link>
          <Link
            to="/transfers"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight size={15} className="text-gray-400 dark:text-neutral-500" />
              <span>Mutasi Stok Lengkap</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </Link>
          <Link
            to="/inventory"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Boxes size={15} className="text-gray-400 dark:text-neutral-500" />
              <span>Inventaris Penuh</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </Link>
          <Link
            to="/online-orders"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={15} className="text-gray-400 dark:text-neutral-500" />
              <span>Order Masuk Web</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </Link>
        </div>

        <SectionLabel>Workspace Cabang</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {WORKSPACES.map((w) => (
            <motion.div
              key={w.label}
              variants={fadeUp}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 cursor-pointer transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${w.color}`} />
              <span className="flex-1 text-left truncate">{w.label}</span>
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                {w.count} unit
              </span>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Bottom Nav */}
      <div className="flex flex-col gap-0.5 border-t border-gray-100 px-3 py-2 dark:border-neutral-800">
        {config.bottomMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200 transition-colors"
            >
              <Icon size={15} className="text-gray-400 dark:text-neutral-500" />
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Account & Role Switcher Widget */}
      <div className="border-t border-gray-100 p-3 dark:border-neutral-800 relative bg-gray-50/50 dark:bg-neutral-900/40">
        <button
          type="button"
          onClick={() => setIsRoleSwitchOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-white dark:hover:bg-neutral-800 transition-all text-left cursor-pointer border border-gray-200/60 dark:border-neutral-800 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar || DEMO_ACCOUNTS[2].user.avatar}
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
              className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl p-2 z-50 space-y-1"
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
