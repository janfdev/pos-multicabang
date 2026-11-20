"use client";

import { useState, useMemo } from "react";
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
  Search,
  Filter,
  Plus,
  Navigation,
  Compass,
  Activity,
  RefreshCw,
  PackageCheck,
  QrCode,
  Check,
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
    typeLabel: "Mutasi Pasokan Antar-Cabang",
    fromName: "Toko 1 (Pusat & Gudang Pasokan)",
    fromAddress: "Jl. Pemuda No. 12, Cirebon (Hub Pasokan)",
    toName: "Toko 2 (Cabang Satelit Kesambi)",
    toAddress: "Jl. Kesambi No. 45, Cirebon (Frontline Kasir)",
    courierName: "Bpk. Ahmad Subarjo",
    courierVehicle: "Mobil Pickup Carry Toko 1 • Plat E 4821 YZ",
    courierPhone: "081234567890",
    status: "IN_TRANSIT",
    statusLabel: "Dalam Perjalanan (In-Transit)",
    eta: "± 8 Menit lagi tiba (Jarak: 1.2 km)",
    notes: "Pasokan darurat sembako untuk mengisi rak display Toko 2 yang menipis.",
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
    toName: "Ibu Siti Rahmawati (Pelanggan Online)",
    toAddress: "Jl. Siliwangi No. 24, Cirebon (1.8 km dari Hub Toko 1)",
    courierName: "Bpk. Dedi Supriyadi",
    courierVehicle: "Motor Kurir Toko • Plat E 3190 XY",
    courierPhone: "081398765432",
    status: "PACKED",
    statusLabel: "Sedang Dikemas (Packing)",
    eta: "Dijadwalkan berangkat 08:30 WIB",
    notes: "Pesanan belanja online portal /shop. Metode pembayaran QRIS Terverifikasi.",
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
    typeLabel: "Mutasi Pasokan Antar-Cabang",
    fromName: "Toko 1 (Pusat & Gudang)",
    fromAddress: "Jl. Pemuda No. 12, Cirebon",
    toName: "Toko 2 (Cabang Satelit Kesambi)",
    toAddress: "Jl. Kesambi No. 45, Cirebon",
    courierName: "Bpk. Ahmad Subarjo",
    courierVehicle: "Mobil Pickup Carry Toko 1",
    courierPhone: "081234567890",
    status: "RECEIVED",
    statusLabel: "Selesai Diterima Cabang",
    eta: "Telah diterima (16:30 WIB)",
    notes: "Pengisian stok bahan kue & sembako harian.",
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_TRANSIT" | "PACKED" | "RECEIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState<ShipmentRecord[]>(INITIAL_SHIPMENTS);
  const [selectedForPrint, setSelectedForPrint] = useState<ShipmentRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Shipment Form State
  const [newType, setNewType] = useState<"TRANSFER" | "DELIVERY">("TRANSFER");
  const [newDriver, setNewDriver] = useState("Bpk. Ahmad Subarjo (Pickup Carry)");
  const [newNotes, setNewNotes] = useState("");

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (filterType !== "ALL" && s.type !== filterType) return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = s.trackingNo.toLowerCase().includes(q);
        const matchDriver = s.courierName.toLowerCase().includes(q);
        const matchTo = s.toName.toLowerCase().includes(q);
        const matchItem = s.items.some((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));
        if (!matchNo && !matchDriver && !matchTo && !matchItem) return false;
      }
      return true;
    });
  }, [shipments, filterType, statusFilter, searchQuery]);

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
            statusLabel: "Selesai Diterima Cabang",
            eta: "Telah diverifikasi & stok cabang diperbarui",
            steps: updatedSteps,
          };
        }
        return s;
      }),
    );
    onNotify(`Surat Jalan ${trackingNo} berhasil dikonfirmasi diterima! Stok di cabang telah otomatis bertambah.`);
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
    onNotify(`Pengiriman ${trackingNo} telah diserahkan ke armada kurir! Status: In-Transit.`);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `trf-${Date.now()}`;
    const code = newType === "TRANSFER" ? `SJ-TRF-202611-${Math.floor(100 + Math.random() * 900)}` : `DO-ONL-202611-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: ShipmentRecord = {
      id: newId,
      trackingNo: code,
      type: newType,
      typeLabel: newType === "TRANSFER" ? "Mutasi Pasokan Antar-Cabang" : "Pengiriman Belanja Online Pelanggan",
      fromName: "Toko 1 (Pusat & Gudang Pasokan)",
      fromAddress: "Jl. Pemuda No. 12, Cirebon (Hub Pasokan)",
      toName: newType === "TRANSFER" ? "Toko 2 (Cabang Satelit Kesambi)" : "Pelanggan Online Cirebon",
      toAddress: newType === "TRANSFER" ? "Jl. Kesambi No. 45, Cirebon" : "Jl. Kartini No. 18, Cirebon",
      courierName: newDriver.includes("Ahmad") ? "Bpk. Ahmad Subarjo" : "Bpk. Dedi Supriyadi",
      courierVehicle: newDriver.includes("Ahmad") ? "Mobil Pickup Carry Toko 1 • Plat E 4821 YZ" : "Motor Kurir Toko • Plat E 3190 XY",
      courierPhone: newDriver.includes("Ahmad") ? "081234567890" : "081398765432",
      status: "PACKED",
      statusLabel: "Sedang Dikemas (Packing)",
      eta: "Siap diberangkatkan dari Hub Toko 1",
      notes: newNotes || "Pengiriman reguler sembako multi-cabang.",
      items: [
        { sku: "BRG-001", name: "Beras Pandan Wangi 5kg", qty: 10, unit: "Karung" },
        { sku: "BRG-002", name: "Minyak Goreng Sawit 2L", qty: 12, unit: "Pouch" },
      ],
      steps: [
        { title: "Surat Jalan Dibuat", time: "Baru Saja", actor: `${currentUser?.name || "Admin"} (T1)`, done: true },
        { title: "Barang Disiapkan di Gudang", time: "Proses", actor: "Gudang Pusat", done: true, active: true },
        { title: "Penyerahan ke Armada Driver", time: "Est. 15 Mnt", actor: newDriver.includes("Ahmad") ? "Bpk. Ahmad" : "Bpk. Dedi", done: false },
        { title: "Penerimaan & Verifikasi Fisik", time: "Est. 30 Mnt", actor: "Petugas Penerima", done: false },
      ],
    };

    setShipments([newRecord, ...shipments]);
    setIsCreateModalOpen(false);
    setNewNotes("");
    onNotify(`Surat Jalan ${code} berhasil diterbitkan dan masuk antrean manifest.`);
  };

  const activeInTransitCount = shipments.filter((s) => s.status === "IN_TRANSIT").length;
  const activePackedCount = shipments.filter((s) => s.status === "PACKED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Visual Live Route Radar & Dispatch Telemetry Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-linear-to-br from-gray-900 via-neutral-900 to-gray-950 p-6 text-white shadow-xl dark:border-neutral-800">
        <div className="absolute -right-12 -top-12 size-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 size-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                Live GPS &amp; Dispatch Radar
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-300">
                Sync Real-time
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
              <span>Radar Rute Distribusi Toko 1</span>
              <ArrowRight size={18} className="text-emerald-400 shrink-0" />
              <span>Toko 2</span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              Pantau posisi armada pengiriman mutasi stok barang antar-gudang dan kurir belanja online secara langsung dengan akurasi serah terima digital.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNotify("Data GPS armada telah disegarkan langsung dari perangkat driver.")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className="text-neutral-400" />
              Segarkan Posisi
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus size={14} />
              Terbitkan Surat Jalan Baru
            </button>
          </div>
        </div>

        {/* Interactive Telemetry Grid */}
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Node Asal */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-blue-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Building2 size={13} />
                Hub Asal (Pemberi Pasokan)
              </span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                Toko 1
              </span>
            </div>
            <p className="text-sm font-bold text-white">Gudang Distribusi Pemuda</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="text-neutral-500 shrink-0" />
              Jl. Pemuda No. 12, Cirebon
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300">
              <span>Status Petugas:</span>
              <span className="font-semibold text-emerald-400">Siap Pasok (Rian K.)</span>
            </div>
          </div>

          {/* Armada In-Transit Status Indicator */}
          <div className="flex flex-col items-center justify-center text-center px-2 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Truck size={16} className="animate-bounce" />
              <span>Armada Meluncur: 1 Mobil Carry</span>
            </div>
            <div className="mt-2 w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-3/4 animate-pulse" />
            </div>
            <div className="mt-2 flex items-center justify-between w-full max-w-[200px] text-[10px] text-neutral-300">
              <span>Jarak: 1.2 km</span>
              <span className="font-bold text-amber-300">ETA: ±8 Menit</span>
            </div>
            <p className="mt-1 text-[10px] text-neutral-400 font-medium">
              Driver: Bpk. Ahmad Subarjo (Plat E 4821 YZ)
            </p>
          </div>

          {/* Node Tujuan */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Store size={13} />
                Hub Tujuan (Penerima)
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Toko 2
              </span>
            </div>
            <p className="text-sm font-bold text-white">Cabang Frontline Kesambi</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} className="text-neutral-500 shrink-0" />
              Jl. Kesambi No. 45, Cirebon
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300">
              <span>Status Petugas:</span>
              <span className="font-semibold text-blue-300">Standby (Dewi Lestari)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Total Pengiriman Aktif</span>
            <span className="flex size-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            {activeInTransitCount + activePackedCount} Pengiriman
          </div>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            {activeInTransitCount} In-Transit • {activePackedCount} Sedang Packing
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Armada Mobil Siaga</span>
            <Truck size={15} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            1 Pickup Carry
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Driver: Bpk. Ahmad Subarjo
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400">
            <span>Jarak Rute Antar-Toko</span>
            <Compass size={15} className="text-emerald-500" />
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
            <span>Verifikasi Serah Terima</span>
            <ShieldCheck size={15} className="text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
            100% Cocok
          </div>
          <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
            Barcode &amp; Tanda Tangan Digital
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Level Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Type Filters */}
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
            Mutasi Cabang ({shipments.filter((s) => s.type === "TRANSFER").length})
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
            Delivery Online ({shipments.filter((s) => s.type === "DELIVERY").length})
          </button>
        </div>

        {/* Search & Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Resi / Driver / Barang..."
              className="w-56 rounded-xl border border-gray-200 bg-white py-1.5 pl-8.5 pr-3 text-xs outline-none placeholder:text-gray-400 focus:border-gray-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <option value="ALL">Semua Status</option>
            <option value="IN_TRANSIT">In-Transit</option>
            <option value="PACKED">Packing</option>
            <option value="RECEIVED">Selesai</option>
          </select>
        </div>
      </div>

      {/* Shipment Cards List */}
      <div className="space-y-4">
        {filteredShipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-xs text-gray-400 dark:border-neutral-800 dark:text-neutral-500">
            Tidak ada data pengiriman yang cocok dengan filter atau kata kunci pencarian.
          </div>
        ) : (
          filteredShipments.map((shipment) => {
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
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
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

                {/* 4-Stage Visual Stepper Timeline */}
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
          })
        )}
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

      {/* Create New Shipment Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Truck className="text-blue-600 size-5" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-neutral-100">
                    Terbitkan Surat Jalan Pengiriman Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateShipment} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    Jenis Pengiriman:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setNewType("TRANSFER")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all cursor-pointer ${
                        newType === "TRANSFER"
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400"
                      }`}
                    >
                      <Building2 size={13} />
                      Mutasi Pasokan (T1 ke T2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType("DELIVERY")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold border transition-all cursor-pointer ${
                        newType === "DELIVERY"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400"
                      }`}
                    >
                      <Store size={13} />
                      Delivery Belanja Online
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    Pilih Armada &amp; Pengemudi:
                  </label>
                  <select
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-700 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    <option value="Bpk. Ahmad Subarjo (Pickup Carry)">Bpk. Ahmad Subarjo — Mobil Pickup Carry (Plat E 4821 YZ)</option>
                    <option value="Bpk. Dedi Supriyadi (Motor Toko)">Bpk. Dedi Supriyadi — Motor Kurir Cepat (Plat E 3190 XY)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    Catatan Khusus Pengiriman:
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Contoh: Pasokan darurat sembako untuk Toko 2..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    Terbitkan Surat Jalan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
