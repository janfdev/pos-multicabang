"use client";

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Bell, Share2, ShoppingBag, ArrowRight } from "lucide-react";
import { themeStore } from "@/lib/themeStore";
import { UserProfile } from "@/lib/authStore";
import { useOnlineOrderAlerts } from "@/lib/useOnlineOrderAlerts";
import { getSidebarConfig } from "./sidebar";

const AVATARS = [
  { id: 1, src: "https://api.dicebear.com/9.x/notionists/svg?seed=JK&backgroundColor=b6e3f4" },
  { id: 2, src: "https://api.dicebear.com/9.x/notionists/svg?seed=AM&backgroundColor=c0aede" },
  { id: 3, src: "https://api.dicebear.com/9.x/notionists/svg?seed=SL&backgroundColor=ffdfbf" },
  { id: 4, src: "https://api.dicebear.com/9.x/notionists/svg?seed=TR&backgroundColor=d1d4f9" },
  { id: 5, src: "https://api.dicebear.com/9.x/notionists/svg?seed=PW&backgroundColor=ffd5dc" },
];

function AvatarStack() {
  return (
    <div className="flex -space-x-1.5 overflow-hidden">
      {AVATARS.map((a) => (
        <img
          key={a.id}
          src={a.src}
          alt={`User ${a.id}`}
          className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
        />
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked ? "bg-gray-900 dark:bg-neutral-50" : "bg-gray-200 dark:bg-neutral-700"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="h-4 w-4 rounded-full bg-white shadow-xs dark:bg-neutral-900"
        style={{ marginLeft: checked ? "18px" : "2px" }}
      />
    </button>
  );
}

function ThemeToggle({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1">
      <button
        type="button"
        onClick={() => setDarkMode(false)}
        aria-label="Switch to light mode"
        className={`flex h-4 w-4 cursor-pointer items-center justify-center ${
          darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-900"
        }`}
      >
        <Sun size={14} />
      </button>

      <Toggle checked={darkMode} onChange={setDarkMode} />

      <button
        type="button"
        onClick={() => setDarkMode(true)}
        aria-label="Switch to dark mode"
        className={`flex h-4 w-4 cursor-pointer items-center justify-center ${
          darkMode ? "text-gray-50" : "text-gray-300 hover:text-gray-500"
        }`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}

export function TopBar({
  title,
  currentUser,
  onNotify,
  actions,
}: {
  title: string;
  currentUser: UserProfile | null;
  onNotify?: (msg: string) => void;
  actions?: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(() => themeStore.getTheme() === "dark");
  const [notifOpen, setNotifOpen] = useState(false);
  const config = getSidebarConfig(currentUser);
  const outletScope =
    currentUser?.outletId === "toko-1" || currentUser?.outletId === "toko-2"
      ? currentUser.outletId
      : "ALL";

  const { pendingCount, latestOrder } = useOnlineOrderAlerts(outletScope, (order) => {
    onNotify?.(`Pesanan online baru ${order.id} dari ${order.customerName} (Rp ${order.totalAmount.toLocaleString("id-ID")})`);
  });

  useEffect(() => {
    const unsub = themeStore.subscribe((t) => setDarkMode(t === "dark"));
    return unsub;
  }, []);

  const handleToggleDark = (toDark: boolean) => {
    setDarkMode(toDark);
    themeStore.setTheme(toDark ? "dark" : "light");
  };

  return (
    <div className="flex flex-col">
      {/* Ambient Outlet Brand Stripe */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.accentStripe}`} />

      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3.5 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-neutral-50">
              {title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-2xs ${config.badgeColor}`}
            >
              <config.storeIcon size={12} className="shrink-0" />
              {config.storeTag}
            </span>
          </div>
          <span className="hidden md:inline text-xs text-gray-400 dark:text-neutral-500">
            • {config.storeAddress}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {actions}

          <ThemeToggle darkMode={darkMode} setDarkMode={handleToggleDark} />

          <button
            onClick={() => onNotify?.("Tautan halaman telah disalin ke clipboard")}
            title="Bagikan Tautan"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
          >
            <Share2 size={15} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              title="Notifikasi Pesanan Online Masuk"
              className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-3.5 z-50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-neutral-50 flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-rose-500" />
                      Antrean Pesanan Online
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      {pendingCount} Menunggu
                    </span>
                  </div>

                  {pendingCount > 0 && latestOrder ? (
                    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 p-2.5 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-900 dark:text-neutral-100">
                          {latestOrder.id}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {latestOrder.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-neutral-400 truncate">
                        Pemesan: <span className="font-semibold text-gray-900 dark:text-neutral-200">{latestOrder.customerName}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                        Layanan: {latestOrder.fulfillmentType === "DELIVERY" ? "Kirim Kurir" : "Ambil di Toko"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 py-2 text-center">
                      Tidak ada pesanan online yang menunggu konfirmasi.
                    </p>
                  )}

                  <Link
                    to="/online-orders"
                    onClick={() => setNotifOpen(false)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Buka Halaman Pesanan Online</span>
                    <ArrowRight size={12} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AvatarStack />
        </div>
      </div>
    </div>
  );
}
