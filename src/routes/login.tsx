import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Store,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { authStore, DEMO_ACCOUNTS, DemoAccount } from '@/lib/authStore';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleApplyAutoFill = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemo(acc.label);
    setError(null);
  };

  const handleQuickLogin = (acc: DemoAccount) => {
    setLoading(true);
    authStore.loginWithDemo(acc);
    setTimeout(() => {
      navigate({ to: '/dashboard' });
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = authStore.login(email, password);
    if (res.success) {
      navigate({ to: '/dashboard' });
    } else {
      setError(res.error || 'Login gagal, periksa email dan password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex size-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 items-center justify-center font-black shadow-md mb-3">
            <Store className="size-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Masuk ke POS Multi-Cabang
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Sistem Kasir, Pergudangan &amp; Distribusi Terintegrasi
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-6 bg-white dark:bg-zinc-900 py-8 px-6 shadow-xs border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-6">
          {/* Quick 1-Click Auto Fill Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Zap className="size-3 text-amber-500 fill-amber-500" />
                <span>Pilih Cepat &amp; Auto-Fill Akun:</span>
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Klik untuk isi otomatis</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.label || email === acc.email;
                const isT1 = acc.user.outletId === 'toko-1';
                const isOwner = acc.user.outletId === 'ALL';

                return (
                  <div
                    key={acc.label}
                    className={`p-3 rounded-2xl border text-xs transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 shadow-xs'
                        : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isOwner
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : isT1
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isOwner ? (
                          <Sparkles className="size-4" />
                        ) : (
                          <Building2 className="size-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                          {acc.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate font-mono">
                          {acc.email} &bull; {acc.user.roleLabel.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplyAutoFill(acc)}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        Auto-Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        Masuk Langsung &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 dark:text-zinc-500 text-[11px]">
                atau gunakan form manual
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Email Pengguna
              </label>
              <div className="relative">
                <Mail className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@pos.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Memvalidasi...' : 'Masuk ke Sistem POS'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Pelanggan umum?</span>
            <Link
              to="/shop"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Buka Katalog Toko Online (/shop) &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
