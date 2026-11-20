"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Printer,
  MessageCircle,
  FileText,
  Boxes,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Building2,
  Store,
  ExternalLink,
} from "lucide-react";
import { UserProfile } from "@/lib/authStore";

export interface ShipmentRecord {
  id: string;
  trackingNo: string;
  type: "TRANSFER" | "DELIVERY";
  typeLabel: string;
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  courierName: string;
  courierVehicle: string;
  courierPhone: string;
  status: "REQUESTED" | "PACKED" | "IN_TRANSIT" | "RECEIVED";
  statusLabel: string;
  eta: string;
  notes: string;
  items: { name: string; sku: string; qty: number; unit: string }[];
  steps: { title: string; time: string; actor: string; done: boolean; active?: boolean }[];
}

const INITIAL_SHIPMENTS: ShipmentRecord[] = [
  {
    id: "trf-1",
    trackingNo: "SJ-TRF-202611-001",
    type: "TRANSFER",
    typeLabel: "Mutasi Antar-Cabang (Pasokan)",
    fromName: "Toko 1 (Pusat & Gudang Pasokan)",
    fromAddress: "Jl. Pemuda No. 12, Cirebon (Gudang Distribusi)",
    toName: "Toko 2 (Cabang Satelit Kesambi)",
    toAddress: "Jl. Kesambi No. 45, Cirebon (Frontline Kasir)",
    courierName: "Bpk. Ahmad Subarjo",
    courierVehicle: "Mobil Pickup Carry Toko 1 • Plat E 4821 YZ",
    courierPhone: "081234567890",
    status: "IN_TRANSIT",
    statusLabel: "Dalam Perjalanan (In-Transit)",
    eta: "± 10 Menit lagi tiba (Jarak: 1.2 km)",
    notes: "Pasokan darurat sembako untuk mengisi rak display Toko 2 yang kritis.",
    items: [
      { sku: "BRG-001", name: "Beras Pandan Wangi 5kg", qty: 20, unit: "Karung" },
      { sku: "BRG-002", name: "Minyak Goreng Sawit 2L", qty: 20, unit: "Pouch" },
      { sku: "BRG-003", name: "Gula Pasir Kristal 1kg", qty: 20, unit: "Bungkus" },
    ],
    steps: [
      { title: "Permintaan Pasokan Diajukan", time: "07:30 WIB", actor: "Dewi Lestari (Kasir T2)", done: true },
      { title: "Barang Dipacking di Gudang Pusat", time: "07:45 WIB", actor: "Rian Kurniawan (Kepala Gudang T1)", done: true },
      { title: "Armada Berangkat Menuju Toko 2", time: "08:05 WIB", actor: "Kurir: Bpk. Ahmad", done: true, active: true },
      { title: "Penerimaan & Cek Barcode di Toko 2", time: "Est. 08:20 WIB", actor: "Menunggu Kedatangan", done: false },
    ],
  },
  {
    id: "onl-1",
    trackingNo: "DO-ONL-202611-088",
    type: "DELIVERY",
    typeLabel: "Pengiriman Belanja Online Pelanggan",
    fromName: "Toko 1 (Pusat & Gudang)",
    fromAddress: "Jl. Pemuda No. 12, Cirebon",
    toName: "Ibu Siti Rahmawati (Pelanggan)",
    toAddress: "Jl. Siliwangi No. 24, Cirebon (1.8 km dari Toko 1)",
    courierName: "Bpk. Dedi Supriyadi",
    courierVehicle: "Motor Kurir Toko • Plat E 3190 XY",
    courierPhone: "081398765432",
    status: "PACKED",
    statusLabel: "Sedang Dikemas (Packing)",
    eta: "Dijadwalkan berangkat 08:30 WIB",
    notes: "Pengiriman belanja online web /shop. Metode pembayaran QRIS.",
    items: [
      { sku: "BRG-011", name: "Telur Ayam Ras 1 Tray (30 butir)", qty: 1, unit: "Tray" },
      { sku: "BRG-012", name: "Mie Instan Goreng Spesial (Dus)", qty: 1, unit: "Dus" },
      { sku: "BRG-007", name: "Kecap Manis Botol 600ml", qty: 2, unit: "Botol" },
    ],
    steps: [
      { title: "Pesanan Online Diterima Sistem", time: "07:55 WIB", actor: "Toko Online (/shop)", done: true },
      { title: "Barang Sedang Dikemas", time: "08:10 WIB", actor: "Kasir Toko 1", done: true, active: true },
      { title: "Kurir Berangkat ke Alamat Pelanggan", time: "Est. 08:30 WIB", actor: "Kurir: Bpk. Dedi", done: false },
      { title: "Serah Terima & Konfirmasi Pelanggan", time: "Est. 08:45 WIB", actor: "Pelanggan: Ibu Siti", done: false },
    ],
  },
  {
    id: "trf-0",
    trackingNo: "SJ-TRF-202611-000",
    type: "TRANSFER",
    typeLabel: "Mutasi Antar-Cabang (Pasokan)",
    fromName: "Toko 1 (Pusat & Gudang)",
    fromAddress: "Jl. Pemuda No. 12, Cirebon",
    toName: "Toko 2 (Cabang Satelit Kesambi)",
    toAddress: "Jl. Kesambi No. 45, Cirebon",
    courierName: "Bpk. Ahmad Subarjo",
    courierVehicle: "Mobil Pickup Carry Toko 1",
    courierPhone: "081234567890",
    status: "RECEIVED",
    statusLabel: "Selesai Diterima",
    eta: "Telah diterima kemarin (16:30 WIB)",
    notes: "Pengisian stok rutin bahan kue & bumbu dapur.",
    items: [
      { sku: "BRG-004", name: "Tepung Terigu Segitiga 1kg", qty: 15, unit: "Bungkus" },
      { sku: "BRG-005", name: "Kopi Arabika Robusta Blend 250g", qty: 10, unit: "Pouch" },
    ],
    steps: [
      { title: "Permintaan Diajukan", time: "15:00 WIB", actor: "Dewi Lestari", done: true },
      { title: "Packing di Gudang Pusat", time: "15:30 WIB", actor: "Rian Kurniawan", done: true },
      { title: "Armada Berangkat", time: "15:55 WIB", actor: "Bpk. Ahmad", done: true },
      { title: "Barang Diterima & Masuk Stok Toko 2", time: "16:30 WIB", actor: "Dewi Lestari (Kasir T2)", done: true },
    ],
  },
];

export default function LiveTrackingModule({
  currentUser,
  onNotify,
}: {
  currentUser: UserProfile | null;
  onNotify: (msg: string) => void;
}) {
  const [filterType, setFilterType] = useState<"ALL" | "TRANSFER" | "DELIVERY">("ALL");
  const [shipments, setShipments] = useState<ShipmentRecord[]>(INITIAL_SHIPMENTS);
  const [selectedForPrint, setSelectedForPrint] = useState<ShipmentRecord | null>(null);

  const filteredShipments = shipments.filter((s) => {
    if (filterType === "ALL") return true;
    return s.type === filterType;
  });

  const handleConfirmReceived = (id: string, trackingNo: string) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedSteps = s.steps.map((step, idx) => {
            if (idx === 3) {
              return {
                ...step,
                done: true,
                active: false,
                time: "Baru Saja",
                actor: `${currentUser?.name || "Kasir"} (Toko 2)`,
              };
            }
            return { ...step, active: false };
          });
          return {
            ...s,
            status: "RECEIVED",
            statusLabel: "Selesai Diterima",
            eta: "Telah diterima & diverifikasi baru saja",
            steps: updatedSteps,
          };
        }
        return s;
      }),
    );
    onNotify(`Surat Jalan ${trackingNo} berhasil dikonfirmasi diterima! Stok di cabang telah otomatis diperbarui.`);
  };

  const handleDispatch = (id: string, trackingNo: string) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedSteps = s.steps.map((step, idx) => {
            if (idx === 2) {
              return { ...step, done: true, active: true, time: "Baru Saja" };
            }
            if (idx === 1) return { ...step, active: false };
            return step;
          });
          return {
            ...s,
            status: "IN_TRANSIT",
            statusLabel: "Dalam Perjalanan (In-Transit)",
            eta: "Kurir sedang meluncur ke alamat tujuan",
            steps: updatedSteps,
          };
        }
        return s;
      }),
    );
    onNotify(`Pengiriman ${trackingNo} diserahkan ke kurir! Status: In-Transit.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Total Pengiriman Aktif</span>
            <span className="flex size-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            2 Pengiriman
          </div>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            1 Mutasi Cabang • 1 Order Online
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Armada In-Transit</span>
            <Truck size={15} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            1 Mobil Carry
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Kurir: Bpk. Ahmad (Plat E 4821 YZ)
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Rute &amp; Jarak Antar-Cabang</span>
            <MapPin size={15} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            1.2 km (±10 Mnt)
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1.5">
            <span>Toko 1 (Pemuda)</span>
            <ArrowRight size={12} className="shrink-0" />
            <span>Toko 2 (Kesambi)</span>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Akurasi Fisik &amp; Barcode</span>
            <ShieldCheck size={15} className="text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            100% Cocok
          </div>
          <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
            Verifikasi Serah Terima Digital
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === "ALL"
                ? "bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            Semua Pengiriman ({shipments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("TRANSFER")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === "TRANSFER"
                ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            <Building2 size={13} />
            Mutasi Antar-Cabang ({shipments.filter((s) => s.type === "TRANSFER").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DELIVERY")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === "DELIVERY"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            <Store size={13} />
            Delivery Belanja Online ({shipments.filter((s) => s.type === "DELIVERY").length})
          </button>
        </div>

        <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
          Sinkronisasi Real-time dengan Driver
        </span>
      </div>

      {/* Shipment Cards List */}
      <div className="space-y-4">
        {filteredShipments.map((shipment) => {
          const isInTransit = shipment.status === "IN_TRANSIT";
          const isReceived = shipment.status === "RECEIVED";
          const isPacked = shipment.status === "PACKED";

          return (
            <div
              key={shipment.id}
              className="rounded-2xl border border-gray-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-900/90 p-5 shadow-2xs hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-neutral-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-neutral-100">
                      {shipment.trackingNo}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        shipment.type === "TRANSFER"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {shipment.typeLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isInTransit
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          : isReceived
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {isInTransit && <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />}
                      {isReceived && <CheckCircle2 size={12} className="text-emerald-500" />}
                      {shipment.statusLabel}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
                    <MapPin size={13} className="text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-neutral-300">{shipment.fromName}</span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-neutral-300">{shipment.toName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedForPrint(shipment)}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <Printer size={13} />
                    Cetak Surat Jalan
                  </button>

                  <a
                    href={`https://wa.me/${shipment.courierPhone}?text=Halo%20${encodeURIComponent(
                      shipment.courierName,
                    )}%20konfirmasi%20pengiriman%20${shipment.trackingNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 transition-colors"
                  >
                    <MessageCircle size={13} />
                    WhatsApp Driver
                  </a>
                </div>
              </div>

              {/* Stepper Timeline Visual */}
              <div className="py-4">
                <div className="relative flex items-center justify-between">
                  {/* Step Connector Line */}
                  <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 dark:bg-neutral-700 -z-0" />

                  {shipment.steps.map((step, idx) => {
                    return (
                      <div key={step.title} className="relative z-10 flex flex-col items-center text-center max-w-[130px] sm:max-w-[160px]">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            step.done && !step.active
                              ? "bg-emerald-600 text-white shadow-xs"
                              : step.active
                                ? "bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse"
                                : "bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700"
                          }`}
                        >
                          {step.done && !step.active ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <p className={`mt-2 text-xs font-semibold leading-tight ${step.active ? "text-amber-600 dark:text-amber-400" : step.done ? "text-gray-900 dark:text-neutral-100" : "text-gray-400 dark:text-neutral-500"}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">
                          {step.time}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold truncate max-w-full">
                          {step.actor}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier & ETA & Items Details */}
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl bg-gray-50/70 p-3.5 dark:bg-neutral-800/40 border border-gray-200/60 dark:border-neutral-800">
                {/* Courier info */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Armada &amp; Pengemudi:
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Truck size={13} className="text-gray-500" />
                    {shipment.courierName}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                    {shipment.courierVehicle}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    Telp: {shipment.courierPhone}
                  </p>
                </div>

                {/* ETA & Destination */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Estimasi Tiba &amp; Lokasi:
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-500" />
                    {shipment.eta}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                    Alamat: {shipment.toAddress}
                  </p>
                </div>

                {/* Items in transit */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Manifest Muatan ({shipment.items.reduce((acc, i) => acc + i.qty, 0)} Unit):
                  </p>
                  <div className="space-y-0.5 max-h-16 overflow-y-auto pr-1">
                    {shipment.items.map((it) => (
                      <p key={it.sku} className="text-[11px] text-gray-700 dark:text-neutral-300 flex justify-between">
                        <span className="truncate">{it.name}</span>
                        <span className="font-bold shrink-0">{it.qty} {it.unit}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-500 dark:text-neutral-400 italic">
                  Catatan: {shipment.notes}
                </span>

                <div className="flex items-center gap-2">
                  {isPacked && (
                    <button
                      type="button"
                      onClick={() => handleDispatch(shipment.id, shipment.trackingNo)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Truck size={14} />
                      Serahkan ke Kurir (Berangkat)
                    </button>
                  )}

                  {isInTransit && (
                    <button
                      type="button"
                      onClick={() => handleConfirmReceived(shipment.id, shipment.trackingNo)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      Konfirmasi Barang Tiba &amp; Diterima di Cabang
                    </button>
                  )}

                  {isReceived && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Selesai &amp; Stok Masuk ke Cabang
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surat Jalan Print Modal */}
      <AnimatePresence>
        {selectedForPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600 size-5" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-neutral-100">
                    Dokumen Resmi Surat Jalan / Pengiriman
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedForPrint(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Body */}
              <div className="mt-4 p-5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 dark:border-neutral-700 dark:bg-neutral-950 text-xs text-gray-800 dark:text-neutral-200 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-200 pb-3 dark:border-neutral-800">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-neutral-100">POS SEMBAKO MULTI-CABANG</p>
                    <p className="text-gray-500">PT. Sembako Makmur Indonesia</p>
                    <p className="text-gray-500">Jl. Pemuda No. 12, Cirebon • Telp: (0231) 234567</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{selectedForPrint.trackingNo}</p>
                    <p className="text-gray-500">Tanggal: 20 Nov 2026</p>
                    <p className="font-bold text-gray-700 dark:text-neutral-300">SURAT JALAN / PENGANTAR</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                    <p className="font-bold text-gray-400 text-[10px] uppercase">PENGIRIM (ASAL):</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedForPrint.fromName}</p>
                    <p className="text-gray-600 dark:text-neutral-400">{selectedForPrint.fromAddress}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                    <p className="font-bold text-gray-400 text-[10px] uppercase">PENERIMA (TUJUAN):</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedForPrint.toName}</p>
                    <p className="text-gray-600 dark:text-neutral-400">{selectedForPrint.toAddress}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-700 dark:text-neutral-300 mb-2">RINCIAN BARANG:</p>
                  <table className="w-full text-left border-collapse border border-gray-200 dark:border-neutral-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-neutral-800">
                        <th className="p-2 border border-gray-200 dark:border-neutral-700">No</th>
                        <th className="p-2 border border-gray-200 dark:border-neutral-700">SKU</th>
                        <th className="p-2 border border-gray-200 dark:border-neutral-700">Nama Barang</th>
                        <th className="p-2 border border-gray-200 dark:border-neutral-700 text-right">Qty</th>
                        <th className="p-2 border border-gray-200 dark:border-neutral-700">Satuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedForPrint.items.map((it, idx) => (
                        <tr key={it.sku}>
                          <td className="p-2 border border-gray-200 dark:border-neutral-700">{idx + 1}</td>
                          <td className="p-2 border border-gray-200 dark:border-neutral-700 font-mono">{it.sku}</td>
                          <td className="p-2 border border-gray-200 dark:border-neutral-700 font-medium">{it.name}</td>
                          <td className="p-2 border border-gray-200 dark:border-neutral-700 text-right font-bold">{it.qty}</td>
                          <td className="p-2 border border-gray-200 dark:border-neutral-700">{it.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-gray-200 dark:border-neutral-800">
                  <div>
                    <p className="text-gray-500 text-[10px]">Petugas Gudang (Pengirim)</p>
                    <div className="h-12 flex items-end justify-center font-bold">Rian Kurniawan</div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Kurir / Pengemudi</p>
                    <div className="h-12 flex items-end justify-center font-bold">{selectedForPrint.courierName}</div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Penerima Barang</p>
                    <div className="h-12 flex items-end justify-center font-bold">Dewi Lestari</div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForPrint(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    onNotify("Mencetak Surat Jalan resmi...");
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  Print Dokumen Surat Jalan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
