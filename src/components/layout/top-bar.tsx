"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Bell, Share2, SlidersHorizontal } from "lucide-react";
import { themeStore } from "@/lib/themeStore";
import { UserProfile } from "@/lib/authStore";
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
  const [notifCount, setNotifCount] = useState(3);
  const config = getSidebarConfig(currentUser);

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
              <span
                className={`size-1.5 rounded-full ${
                  config.outletId === "toko-1"
                    ? "bg-blue-500"
                    : config.outletId === "toko-2"
                      ? "bg-emerald-500"
                      : "bg-purple-500"
                } animate-pulse`}
              />
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

          <button
            onClick={() => {
              setNotifCount(0);
              onNotify?.("Semua notifikasi ditandai telah dibaca");
            }}
            title="Notifikasi"
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
          >
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
                {notifCount}
              </span>
            )}
          </button>

          <AvatarStack />
        </div>
      </div>
    </div>
  );
}
