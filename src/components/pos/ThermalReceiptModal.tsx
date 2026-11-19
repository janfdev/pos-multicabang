import { useState } from 'react';
import { Printer, X, Check, Copy } from 'lucide-react';

export type ThermalReceiptData = {
  id: string;
  outletId: string;
  outletName: string;
  outletAddress?: string;
  cashierName?: string;
  createdAt: string;
  paymentMethod: string;
  totalAmount: number;
  cashReceived: number;
  cashChange: number;
  items: Array<{
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
};

export function ThermalReceiptModal({
  order,
  onClose,
}: {
  order: ThermalReceiptData | null;
  onClose: () => void;
}) {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReceipt = `
================================
     ${order.outletName.toUpperCase()}
  ${order.outletAddress || 'Sistem POS Multi-Cabang'}
================================
No. TRX : ${order.id}
Tanggal : ${new Date(order.createdAt).toLocaleString('id-ID')}
Kasir   : ${order.cashierName || 'Kasir Toko'}
--------------------------------
${order.items
  .map(
    (it) =>
      `${it.productName.slice(0, 24)}\n  ${it.qty} x Rp ${it.unitPrice.toLocaleString('id-ID')} = Rp ${it.subtotal.toLocaleString('id-ID')}`
  )
  .join('\n')}
--------------------------------
TOTAL    : Rp ${order.totalAmount.toLocaleString('id-ID')}
BAYAR    : Rp ${order.cashReceived.toLocaleString('id-ID')} (${order.paymentMethod})
KEMBALI  : Rp ${order.cashChange.toLocaleString('id-ID')}
================================
 TERIMA KASIH ATAS KUNJUNGAN ANDA
     SIMPAN STRUK INI DENGAN BAIK
================================
    `.trim();

    navigator.clipboard.writeText(textReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Print styles injected for this modal */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible !important;
          }
          #thermal-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === '58mm' ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: 2mm !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
              <Printer className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Struk Thermal Kasir
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Siap cetak ke printer kasir Bluetooth / USB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Paper selector */}
            <div className="flex bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  paperWidth === '58mm'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  paperWidth === '80mm'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                80mm
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Paper Receipt Simulation Preview */}
        <div className="p-4 overflow-y-auto bg-zinc-100 dark:bg-zinc-950/70 flex justify-center">
          <div
            id="thermal-print-area"
            style={{ width: paperWidth === '58mm' ? '280px' : '360px' }}
            className="bg-white text-zinc-900 p-4 font-mono text-[11px] leading-tight shadow-md border border-zinc-200 rounded-lg select-text"
          >
            {/* Store Title */}
            <div className="text-center pb-2 border-b border-dashed border-zinc-400 space-y-0.5">
              <p className="font-extrabold text-sm tracking-tight">{order.outletName}</p>
              <p className="text-[10px] text-zinc-600">{order.outletAddress || 'Jl. Pemuda No. 12, Cirebon'}</p>
              <p className="text-[10px] text-zinc-600">Telp: 0812-3456-7890</p>
            </div>

            {/* Order Info */}
            <div className="py-2 border-b border-dashed border-zinc-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{order.cashierName || 'Kasir 01'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2 border-b border-dashed border-zinc-400 space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold truncate">{it.productName}</p>
                  <div className="flex justify-between text-[10px] text-zinc-700">
                    <span>
                      {it.qty} x Rp {it.unitPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold">
                      Rp {it.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-zinc-400 space-y-1 text-xs">
              <div className="flex justify-between font-black">
                <span>TOTAL:</span>
                <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Bayar ({order.paymentMethod}):</span>
                <span>Rp {order.cashReceived.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Kembalian:</span>
                <span>Rp {order.cashChange.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-zinc-500">
              <p className="font-bold uppercase tracking-wider text-zinc-700">
                Terima Kasih Atas Kunjungan Anda
              </p>
              <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
              <p className="font-mono text-[8px] pt-1">*** SIMPAN STRUK INI ***</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <Printer className="size-3.5" />
            <span>Cetak Thermal ({paperWidth})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
