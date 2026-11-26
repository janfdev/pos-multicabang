import { useState, useEffect } from 'react';
import { shiftStore, type ShiftSession } from '@/lib/shiftStore';
import { Wallet, X, Clock, CheckCircle2, AlertCircle, Printer, ArrowRight } from 'lucide-react';

export function ShiftModal({
  isOpen,
  outletId,
  outletName,
  cashierName,
  onClose,
  onShiftChanged,
}: {
  isOpen: boolean;
  outletId: string;
  outletName: string;
  cashierName: string;
  onClose: () => void;
  onShiftChanged: (shift: ShiftSession | null) => void;
}) {
  const [activeShift, setActiveShift] = useState<ShiftSession | null>(null);
  const [initialCash, setInitialCash] = useState<number>(200000);
  const [actualCash, setActualCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [step, setStep] = useState<'VIEW' | 'CLOSED_SUMMARY'>('VIEW');
  const [closedSession, setClosedSession] = useState<ShiftSession | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = shiftStore.getActiveShift(outletId);
      setActiveShift(current);
      if (current) {
        setActualCash(current.initialCash + current.cashSales);
      }
    }
  }, [isOpen, outletId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenShift = () => {
    const shift = shiftStore.openShift(outletId, cashierName, initialCash);
    setActiveShift(shift);
    onShiftChanged(shift);
  };

  const handleCloseShift = () => {
    if (!activeShift) return;
    const closed = shiftStore.closeShift(outletId, actualCash, closingNotes);
    if (closed) {
      setClosedSession(closed);
      setActiveShift(null);
      setStep('CLOSED_SUMMARY');
      onShiftChanged(null);
    }
  };

  const handlePrintShiftReport = () => {
    window.print();
  };

  const expectedCash = activeShift ? activeShift.initialCash + activeShift.cashSales : 0;
  const discrepancy = actualCash - expectedCash;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Shift Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #shift-print-slip, #shift-print-slip * { visibility: visible !important; }
          #shift-print-slip {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 58mm !important;
            margin: 0 !important;
            padding: 3mm !important;
            background: #fff !important;
            color: #000 !important;
            font-family: 'Courier New', monospace !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Manajemen Shift &amp; Kas Laci
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{outletName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {step === 'CLOSED_SUMMARY' && closedSession ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  Shift Berhasil Ditutup
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Rekapitulasi kasir telah disimpan ke audit log.
                </p>
              </div>

              {/* Printable Slip Preview */}
              <div
                id="shift-print-slip"
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] space-y-1"
              >
                <div className="text-center font-bold pb-1 border-b border-zinc-300 dark:border-zinc-700">
                  LAPORAN REKAP SHIFT KASIR
                  <br />
                  <span className="text-[10px] font-normal">{outletName}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Kasir:</span>
                  <span className="font-bold">{closedSession.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buka:</span>
                  <span>{new Date(closedSession.openedAt).toLocaleTimeString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tutup:</span>
                  <span>{closedSession.closedAt ? new Date(closedSession.closedAt).toLocaleTimeString('id-ID') : '-'}</span>
                </div>
                <div className="border-t border-zinc-300 dark:border-zinc-700 my-1 pt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Modal Awal:</span>
                    <span>Rp {closedSession.initialCash.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan Tunai:</span>
                    <span className="font-bold">Rp {closedSession.cashSales.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan QRIS:</span>
                    <span>Rp {closedSession.qrisSales.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-zinc-300 dark:border-zinc-700 pt-1">
                    <span>Total Fisik di Laci:</span>
                    <span>Rp {(closedSession.actualCashInDrawer ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Selisih Kas:</span>
                    <span>Rp {(closedSession.cashDiscrepancy ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintShiftReport}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Cetak Rekap</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('VIEW');
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          ) : !activeShift ? (
            /* Formulir Buka Shift */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p>
                  Belum ada shift kasir yang aktif untuk cabang ini. Masukkan kas modal awal laci untuk memulai transaksi.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nama Kasir yang Bertugas
                </label>
                <input
                  type="text"
                  value={cashierName}
                  disabled
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Modal Kas Awal di Laci (Float Cash)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">Rp</span>
                  <input
                    type="number"
                    value={initialCash || ''}
                    onChange={(e) => setInitialCash(Number(e.target.value))}
                    placeholder="200000"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[100000, 200000, 300000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialCash(amt)}
                      className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      {(amt / 1000).toLocaleString('id-ID')}k
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenShift}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Mulai Buka Shift Kasir</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          ) : (
            /* Monitoring Shift Aktif & Formulir Tutup Shift */
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700/60">
                  <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                    <Clock className="size-3.5" />
                    Dibuka sejak:
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {new Date(activeShift.openedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <p className="text-zinc-400">Kas Awal (Modal)</p>
                    <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      Rp {activeShift.initialCash.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <p className="text-zinc-400">Total Transaksi</p>
                    <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {activeShift.totalTransactions} Struk
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <p className="text-zinc-400">Penjualan Tunai</p>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {activeShift.cashSales.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <p className="text-zinc-400">Penjualan QRIS</p>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      Rp {activeShift.qrisSales.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl flex justify-between items-center text-xs font-bold text-blue-900 dark:text-blue-300">
                  <span>Kas Fisik Seharusnya:</span>
                  <span className="font-mono text-sm">Rp {expectedCash.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Hitung Uang Fisik Kasir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex justify-between">
                  <span>Uang Fisik Dihitung di Laci</span>
                  {discrepancy !== 0 && (
                    <span className={discrepancy > 0 ? 'text-blue-600 font-bold' : 'text-red-500 font-bold'}>
                      {discrepancy > 0 ? `+ Lebih Rp ${discrepancy.toLocaleString('id-ID')}` : `- Kurang Rp ${Math.abs(discrepancy).toLocaleString('id-ID')}`}
                    </span>
                  )}
                  {discrepancy === 0 && (
                    <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 size={13} className="shrink-0" />
                      Seimbang (Balance)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">Rp</span>
                  <input
                    type="number"
                    value={actualCash || ''}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Catatan Tutup Shift (Opsional)
                </label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Contoh: Serah terima lancar ke shift 2"
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleCloseShift}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-98"
              >
                Tutup Shift &amp; Hitung Kas Laci
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
