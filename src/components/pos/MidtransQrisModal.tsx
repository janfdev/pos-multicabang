import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface MidtransQrisModalProps {
  isOpen: boolean;
  orderId: string | null;
  grossAmount: number;
  outletName: string;
  cashierName: string;
  onSuccess: (order: any) => void;
  onClose: () => void;
}

export function MidtransQrisModal({
  isOpen,
  orderId,
  grossAmount,
  outletName,
  cashierName,
  onSuccess,
  onClose,
}: MidtransQrisModalProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !orderId) return null;

  const handleSimulateSettlement = async () => {
    setIsSimulating(true);
    setError(null);

    try {
      const res = await fetch('/api/pos/midtrans/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          transaction_status: 'settlement',
          payment_type: 'qris',
          gross_amount: `${grossAmount}.00`,
          signature_key: 'sandbox-signature-verified',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1600, 0.15);
        onSuccess(data.order);
      } else {
        setError(data.error || 'Simulasi pembayaran gagal.');
      }
    } catch {
      setError('Terjadi gangguan jaringan saat memverifikasi pembayaran.');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-4 text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-left">
              <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrCode className="size-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-neutral-100">
                  QRIS Midtrans Sandbox
                </h3>
                <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                  {outletName} • {cashierName}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center text-gray-400 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Display */}
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
              Total Tagihan POS
            </span>
            <div className="font-mono font-black text-xl text-gray-900 dark:text-neutral-50 tracking-tight">
              {formatRupiah(grossAmount)}
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              ID: {orderId}
            </span>
          </div>

          {/* Mock QR Code Frame */}
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-700 mx-auto w-fit space-y-2">
            <div className="size-44 bg-neutral-950 p-2 rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Stylized QR Matrix Pattern */}
              <div className="size-full bg-white rounded-lg p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="size-8 border-4 border-black rounded-xs flex items-center justify-center">
                    <div className="size-3 bg-black" />
                  </div>
                  <div className="size-8 border-4 border-black rounded-xs flex items-center justify-center">
                    <div className="size-3 bg-black" />
                  </div>
                </div>
                <div className="flex items-center justify-center my-auto">
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-xs">
                    QRIS
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="size-8 border-4 border-black rounded-xs flex items-center justify-center">
                    <div className="size-3 bg-black" />
                  </div>
                  <div className="size-6 grid grid-cols-2 gap-1 p-0.5">
                    <div className="bg-black size-2" />
                    <div className="bg-black size-2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-semibold">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>NMID: ID102026111901</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-snug">
            Arahkan kamera e-wallet (GoPay, OVO, Dana, BCA, Livin') pelanggan ke kode QRIS di atas.
          </p>

          {/* Action Simulation for Capstone Testing & Demo */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleSimulateSettlement}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Memverifikasi Webhook...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Simulasi Pembayaran Berhasil (Settlement)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer font-semibold"
            >
              Batal &amp; Pilih Tunai
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
