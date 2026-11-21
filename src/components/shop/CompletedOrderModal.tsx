import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageCircle } from 'lucide-react';

export interface CompletedOrderData {
  id: string;
  customerName: string;
  customerPhone?: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string | null;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
}

interface CompletedOrderModalProps {
  order: CompletedOrderData | null;
  onClose: () => void;
  formatRupiah: (val: number) => string;
}

export function CompletedOrderModal({
  order,
  onClose,
  formatRupiah,
}: CompletedOrderModalProps) {
  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-4 text-center"
          >
            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-neutral-50">
                Pesanan Berhasil Dibuat!
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                ID Pesanan:{' '}
                <strong className="font-mono text-gray-800 dark:text-neutral-200 font-bold">
                  {order.id}
                </strong>
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-neutral-800/60 rounded-2xl border border-gray-100 dark:border-neutral-800 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400 font-sans">Pemesan:</span>
                <span className="font-bold text-gray-800 dark:text-neutral-200">
                  {order.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-sans">Layanan:</span>
                <span className="font-bold text-gray-800 dark:text-neutral-200">
                  {order.fulfillmentType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-sans">Subtotal Barang:</span>
                <span className="font-bold text-gray-800 dark:text-neutral-200">
                  {formatRupiah(order.subtotal || order.totalAmount)}
                </span>
              </div>
              {order.fulfillmentType === 'DELIVERY' && (
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Ongkos Kirim:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(order.deliveryFee ?? 0) > 0 ? formatRupiah(order.deliveryFee!) : 'GRATIS'}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200/60 dark:border-neutral-700/60 pt-1.5">
                <span className="text-gray-400 font-sans">Total Tagihan:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/6281234567801?text=${encodeURIComponent(
                  `Halo Admin Toko Sembako, saya ingin konfirmasi pesanan:\n• ID Pesanan: *${order.id}*\n• Nama: *${order.customerName}*\n• Layanan: *${order.fulfillmentType}*\n• Subtotal: *${formatRupiah(
                    order.subtotal || order.totalAmount
                  )}*\n• Ongkir: *${(order.deliveryFee ?? 0) > 0 ? formatRupiah(order.deliveryFee!) : 'GRATIS'}*\n• Total Tagihan: *${formatRupiah(
                    order.totalAmount
                  )}*${order.deliveryAddress ? `\n• Alamat: ${order.deliveryAddress}` : ''}\n\nMohon diproses ya. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="size-4" />
                <span>Kirim Rincian ke WhatsApp Toko</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-pointer"
              >
                Tutup &amp; Kembali Belanja
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
