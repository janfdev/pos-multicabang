import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  Store,
  RefreshCw,
  History,
  FileText,
} from 'lucide-react';
import { playBeep } from '@/lib/audio';

export interface ProductInventoryOption {
  product: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  toko1Stock: number;
  toko2Stock: number;
}

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductInventoryOption[];
  activeOutletId: 'toko-1' | 'toko-2';
  onOpnameSuccess: () => void;
}

export function StockOpnameModal({
  isOpen,
  onClose,
  products,
  activeOutletId,
  onOpnameSuccess,
}: StockOpnameModalProps) {
  const [selectedOutlet, setSelectedOutlet] = useState<'toko-1' | 'toko-2'>(activeOutletId);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.product.id || '');
  const [actualStock, setActualStock] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View mode: 'FORM' or 'AUDIT_LOGS'
  const [activeTab, setActiveTab] = useState<'FORM' | 'LOGS'>('FORM');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  if (!isOpen) return null;

  const currentItem = products.find((p) => p.product.id === selectedProductId) || products[0];
  const systemStock = currentItem
    ? selectedOutlet === 'toko-1'
      ? currentItem.toko1Stock
      : currentItem.toko2Stock
    : 0;

  const parsedActual = actualStock !== '' ? Number(actualStock) : NaN;
  const difference = !isNaN(parsedActual) ? parsedActual - systemStock : 0;

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/inventory/stock-opname/audit?outletId=${selectedOutlet}`);
      const data = await res.json();
      setAuditLogs(data);
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleTabChange = (tab: 'FORM' | 'LOGS') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    if (tab === 'LOGS') {
      loadAuditLogs();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isNaN(parsedActual) || parsedActual < 0) {
      setError('Masukkan angka stok fisik riil yang valid (minimal 0).');
      return;
    }

    if (!reason.trim()) {
      setError('Alasan penyesuaian wajib diisi untuk jejak audit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: selectedOutlet,
          productId: currentItem.product.id,
          actualStock: parsedActual,
          reason: reason.trim(),
          adjustedBy: 'Petugas Inventaris Toko',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1400, 0.15);
        setSuccessMessage(data.message || 'Stok fisik berhasil disesuaikan.');
        setActualStock('');
        setReason('');
        onOpnameSuccess();
      } else {
        setError(data.error || 'Gagal menyimpan penyesuaian stok.');
      }
    } catch {
      setError('Terjadi gangguan jaringan saat memproses stock opname.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ClipboardCheck className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Stock Opname &amp; Penyesuaian Fisik
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Audit fisik barang, hitung selisih, dan rekam jejak audit
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('FORM')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'FORM'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="size-3.5" />
              <span>Input Hasil Fisik</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('LOGS')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'LOGS'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <History className="size-3.5" />
              <span>Riwayat Audit Opname</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'FORM' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Outlet Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Pilih Cabang Opname:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOutlet('toko-1')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedOutlet === 'toko-1'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Building2 className="size-3.5" />
                    <span>Toko 1 (Gudang Pusat)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOutlet('toko-2')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedOutlet === 'toko-2'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Store className="size-3.5" />
                    <span>Toko 2 (Cabang Satelit)</span>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Pilih Produk:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                >
                  {products.map((item) => (
                    <option key={item.product.id} value={item.product.id}>
                      [{item.product.sku}] {item.product.name} (Stok Sistem:{' '}
                      {selectedOutlet === 'toko-1' ? item.toko1Stock : item.toko2Stock}{' '}
                      {item.product.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* System vs Physical Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 block font-medium">Stok Sistem</span>
                  <span className="font-mono font-bold text-base text-zinc-800 dark:text-zinc-200">
                    {systemStock} <span className="text-[10px] font-normal">{currentItem?.product.unit}</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 block font-medium">Hasil Fisik</span>
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-50">
                    {!isNaN(parsedActual) ? parsedActual : '-'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 block font-medium">Selisih Penyesuaian</span>
                  <span
                    className={`font-mono font-black text-base ${
                      difference < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : difference > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {!isNaN(parsedActual) ? (difference >= 0 ? `+${difference}` : difference) : '-'}
                  </span>
                </div>
              </div>

              {/* Actual Physical Count Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Jumlah Stok Fisik Riil Terhitung *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder={`Contoh: ${systemStock}`}
                  value={actualStock}
                  onChange={(e) => setActualStock(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Reason Textarea (Mandatory per Business Rule 11) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Alasan Penyesuaian Stok Fisik *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: 1 Sak bocor saat dipindahkan, selisih hitung fisik bulanan..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || actualStock === ''}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan Penyesuaian...' : 'Simpan Penyesuaian & Rekam Audit'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            /* Audit Logs View */
            <div className="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
              {loadingLogs ? (
                <div className="py-8 text-center text-zinc-400 flex items-center justify-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Memuat riwayat audit...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">
                  Belum ada catatan audit stock opname untuk cabang ini.
                </div>
              ) : (
                auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {log.productName}
                      </span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          log.difference < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {log.difference >= 0 ? `+${log.difference}` : log.difference}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Stok: {log.previousStock} &rarr; {log.actualStock}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 italic pt-0.5">
                      &ldquo;{log.reason}&rdquo;
                    </p>
                    <div className="text-[10px] text-zinc-400">
                      Oleh: {log.adjustedBy} • {log.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
