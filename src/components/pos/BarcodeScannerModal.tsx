import { useState, useEffect, useRef } from 'react';
import { Camera, X, Barcode, Check } from 'lucide-react';
import { playBeep } from '@/lib/audio';

export function BarcodeScannerModal({
  isOpen,
  products,
  onScanSuccess,
  onClose,
}: {
  isOpen: boolean;
  products: any[];
  onScanSuccess: (product: any) => void;
  onClose: () => void;
}) {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      setErrorMsg('');
      setManualCode('');
      // Attempt camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              setCameraActive(true);
            }
          })
          .catch(() => {
            setCameraActive(false);
          });
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === trimmed.toLowerCase())
    );

    if (matched) {
      playBeep(1400, 0.1);
      onScanSuccess(matched);
      onClose();
    } else {
      playBeep(400, 0.2);
      setErrorMsg(`Barcode "${trimmed}" tidak cocok dengan produk manapun.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
              <Camera className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pemindai Barcode Kasir
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Arahkan barcode ke dalam bingkai kamera
              </p>
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

        {/* Viewfinder Area */}
        <div className="relative bg-black h-56 flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-zinc-400 space-y-2">
              <Barcode className="size-10 mx-auto text-zinc-600 animate-pulse" />
              <p className="text-xs">
                Kamera tidak aktif atau gunakan barcode scanner gun USB (keystroke otomatis).
              </p>
            </div>
          )}

          {/* Reticle Overlay */}
          <div className="absolute inset-x-8 inset-y-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" />
          </div>
        </div>

        {/* Manual Barcode Input Fallback */}
        <div className="p-4 space-y-3">
          {errorMsg && (
            <p className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900">
              {errorMsg}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
              Input Barcode Manual / Uji Kode
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessCode(manualCode);
                }}
                placeholder="Contoh: 89912345601 atau BRG-001"
                className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleProcessCode(manualCode)}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Quick preset barcode chips for instant testing */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 block">Klik cepat contoh barcode produk:</span>
            <div className="flex flex-wrap gap-1">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProcessCode(p.barcode || p.sku)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  {p.barcode || p.sku} ({p.name.slice(0, 10)}...)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
