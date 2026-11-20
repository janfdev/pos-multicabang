"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { authStore, UserProfile } from "@/lib/authStore";
import { themeStore } from "@/lib/themeStore";

type Toast = { id: number; message: string };

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl dark:border dark:border-neutral-700 dark:bg-neutral-800"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function DashboardLayout({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStore.getUser());
  const [darkMode, setDarkMode] = useState(() => themeStore.getTheme() === "dark");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const unsubAuth = authStore.subscribe((u) => setCurrentUser(u));
    const unsubTheme = themeStore.subscribe((t) => setDarkMode(t === "dark"));
    return () => {
      unsubAuth();
      unsubTheme();
    };
  }, []);

  const pushToast = (message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="relative flex h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
        <Sidebar currentUser={currentUser} onNotify={pushToast} />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            title={title}
            currentUser={currentUser}
            onNotify={pushToast}
            actions={actions}
          />

          <div className="relative flex-1 overflow-y-auto pb-6">
            {children}
          </div>
        </main>

        <ToastStack toasts={toasts} />
      </div>
    </div>
  );
}
export default DashboardLayout;
