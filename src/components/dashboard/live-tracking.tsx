"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Printer,
  MessageCircle,
  FileText,
  Building2,
  Store,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Download,
  Plus,
  ChevronDown,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { UserProfile } from "@/lib/authStore";
import { StatsCards, StatItem } from "@/components/dashboard/stats-cards";
import { BagTable, ColumnDef, TableRow } from "@/components/dashboard/bag-table";

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
    typeLabel: "Mutasi Pasokan (T1 ke T2)",
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
    typeLabel: "Delivery Belanja Online (/shop)",
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
    typeLabel: "Mutasi Pasokan (T1 ke T2)",
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked ? "bg-gray-900 dark:bg-neutral-100" : "bg-gray-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`inline-block size-3.5 transform rounded-full bg-white dark:bg-neutral-900 transition-transform duration-200 ${
          checked ? "translate-x-4.5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function LiveTrackingModule({
  currentUser,
  onNotify,
}: {
  currentUser: UserProfile | null;
  onNotify: (msg: string) => void;
}) {
  const [showStats, setShowStats] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "TRANSFER" | "DELIVERY">("ALL");
  const [shipments, setShipments] = useState<ShipmentRecord[]>(INITIAL_SHIPMENTS);
  const [activeShipmentDetail, setActiveShipmentDetail] = useState<ShipmentRecord | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<ShipmentRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newType, setNewType] = useState<"TRANSFER" | "DELIVERY">("TRANSFER");
  const [newDriver, setNewDriver] = useState("Bpk. Ahmad Subarjo (Pickup Carry)");
  const [newNotes, setNewNotes] = useState("");

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
    if (activeShipmentDetail?.id === id) {
      setActiveShipmentDetail((prev) =>
        prev
          ? {
              ...prev,
              status: "RECEIVED",
              statusLabel: "Selesai Diterima Cabang",
              eta: "Telah diverifikasi & stok cabang diperbarui",
            }
          : null,
      );
    }
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
    if (activeShipmentDetail?.id === id) {
      setActiveShipmentDetail((prev) =>
        prev
          ? {
              ...prev,
              status: "IN_TRANSIT",
              statusLabel: "Dalam Perjalanan (In-Transit)",
              eta: "Kurir sedang meluncur ke alamat tujuan",
            }
          : null,
      );
    }
    onNotify(`Pengiriman ${trackingNo} telah diserahkan ke armada kurir! Status: In-Transit.`);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `trf-${Date.now()}`;
    const code =
      newType === "TRANSFER"
        ? `SJ-TRF-202611-${Math.floor(100 + Math.random() * 900)}`
        : `DO-ONL-202611-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: ShipmentRecord = {
      id: newId,
      trackingNo: code,
      type: newType,
      typeLabel: newType === "TRANSFER" ? "Mutasi Pasokan (T1 ke T2)" : "Delivery Belanja Online (/shop)",
      fromName: "Toko 1 (Pusat & Gudang Pasokan)",
      fromAddress: "Jl. Pemuda No. 12, Cirebon (Hub Pasokan)",
      toName: newType === "TRANSFER" ? "Toko 2 (Cabang Satelit Kesambi)" : "Pelanggan Online Cirebon",
      toAddress: newType === "TRANSFER" ? "Jl. Kesambi No. 45, Cirebon" : "Jl. Kartini No. 18, Cirebon",
      courierName: newDriver.includes("Ahmad") ? "Bpk. Ahmad Subarjo" : "Bpk. Dedi Supriyadi",
      courierVehicle: newDriver.includes("Ahmad")
        ? "Mobil Pickup Carry Toko 1 • Plat E 4821 YZ"
        : "Motor Kurir Toko • Plat E 3190 XY",
      courierPhone: newDriver.includes("Ahmad") ? "081234567890" : "081398765432",
      status: "PACKED",
      statusLabel: "Sedang Dikemas (Packing)",
      eta: "Siap diberangkatkan dari Hub Toko 1",
      notes: newNotes || "Pengiriman reguler logistik sembako.",
      items: [
        { sku: "BRG-001", name: "Beras Pandan Wangi 5kg", qty: 10, unit: "Karung" },
        { sku: "BRG-002", name: "Minyak Goreng Sawit 2L", qty: 12, unit: "Pouch" },
      ],
      steps: [
        { title: "Surat Jalan Dibuat", time: "Baru Saja", actor: `${currentUser?.name || "Admin"} (T1)`, done: true },
        { title: "Barang Disiapkan di Gudang", time: "Proses", actor: "Gudang Pusat", done: true, active: true },
        {
          title: "Penyerahan ke Armada Driver",
          time: "Est. 15 Mnt",
          actor: newDriver.includes("Ahmad") ? "Bpk. Ahmad" : "Bpk. Dedi",
          done: false,
        },
        { title: "Penerimaan & Verifikasi Fisik", time: "Est. 30 Mnt", actor: "Petugas Penerima", done: false },
      ],
    };

    setShipments([newRecord, ...shipments]);
    setIsCreateModalOpen(false);
    setNewNotes("");
    onNotify(`Surat Jalan ${code} berhasil diterbitkan dan masuk antrean manifest.`);
  };

  const handleExportCSV = () => {
    const headers = ["No Surat Jalan", "Jenis", "Asal", "Tujuan", "Kurir", "Status", "Manifest"];
    const rows = shipments.map((s) => [
      s.trackingNo,
      s.typeLabel,
      s.fromName,
      s.toName,
      s.courierName,
      s.status,
      `${s.items.reduce((a, b) => a + b.qty, 0)} Unit`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tracking_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("Data manifest pengiriman berhasil diekspor ke CSV!");
  };

  // BagUI Stat Cards Data
  const stats: StatItem[] = [
    {
      label: "Total Pengiriman Aktif",
      value: `${shipments.filter((s) => s.status !== "RECEIVED").length} Pengiriman`,
      delta: "+1 aktif hari ini",
    },
    {
      label: "Armada In-Transit",
      value: "1 Pickup Carry",
      delta: "Kurir: Bpk. Ahmad",
    },
    {
      label: "Jarak Tempuh Antar-Toko",
      value: "1.2 km",
      delta: "±10 Menit Tempuh",
    },
    {
      label: "Akurasi Fisik Barcode",
      value: "100% Cocok",
      delta: "Verifikasi Digital",
    },
  ];

  // BagUI Table Definitions
  const columns: ColumnDef[] = [
    { key: "trackingNo", label: "No. Surat Jalan & Resi" },
    { key: "typeLabel", label: "Jenis Pengiriman" },
    { key: "courier", label: "Armada & Pengemudi" },
    { key: "manifest", label: "Volume Muatan" },
    { key: "status", label: "Status Real-time" },
    { key: "action", label: "Tindakan" },
  ];

  const tableRows: TableRow[] = useMemo(() => {
    const data = filterType === "ALL" ? shipments : shipments.filter((s) => s.type === filterType);
    return data.map((s) => {
      const totalUnits = s.items.reduce((acc, it) => acc + it.qty, 0);
      return {
        id: s.id,
        status: s.status,
        cells: {
          trackingNo: s.trackingNo,
          typeLabel: s.typeLabel,
          courier: `${s.courierName} (${s.courierVehicle.split("•")[0].trim()})`,
          manifest: `${totalUnits} Unit (${s.items.map((i) => i.name.split(" ")[0]).join(", ")})`,
          tindakan: "Pantau Rute & Cetak",
        },
      };
    });
  }, [shipments, filterType]);

  const handleActionClick = (actionText: string, row: TableRow) => {
    const found = shipments.find((s) => s.id === row.id);
    if (found) {
      setActiveShipmentDetail(found);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* BagUI Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Table View Button */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <LayoutGrid size={14} className="text-gray-400 dark:text-neutral-500" />
              <span>Table View</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs outline-none hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <option value="ALL">Semua Jenis Rute</option>
              <option value="TRANSFER">Mutasi Pasokan Antar-Cabang</option>
              <option value="DELIVERY">Delivery Belanja Online</option>
            </select>
          </div>

          {/* Show Statistics Toggle */}
          <div className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
              Show Statistics
            </span>
            <Toggle checked={showStats} onChange={setShowStats} />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNotify("Kustomisasi tampilan kolom aktif")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-gray-400 dark:text-neutral-500" />
            <span>Customize</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <Download size={14} className="text-gray-400 dark:text-neutral-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Tambah Pengiriman</span>
          </button>
        </div>
      </div>

      {/* BagUI 4-Grid KPI Stat Cards */}
      {showStats && <StatsCards stats={stats} />}

      {/* Authentic BagUI Table */}
      <div className="pt-1">
        <BagTable
          columns={columns}
          rows={tableRows}
          onActionClick={handleActionClick}
          searchPlaceholder="Cari nomor surat jalan, driver, atau barang..."
        />
      </div>

      {/* Detail & Tracking Modal (BagUI Dialog) */}
      <AnimatePresence>
        {activeShipmentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-neutral-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-gray-900 dark:text-neutral-100">
                      {activeShipmentDetail.trackingNo}
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      {activeShipmentDetail.typeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{activeShipmentDetail.fromName}</span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-neutral-200">
                      {activeShipmentDetail.toName}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveShipmentDetail(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 4-Stage Visual Stepper Timeline */}
              <div className="py-5 border-b border-gray-100 dark:border-neutral-800">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 dark:bg-neutral-700 -z-0" />
                  {activeShipmentDetail.steps.map((step, idx) => (
                    <div
                      key={step.title}
                      className="relative z-10 flex flex-col items-center text-center max-w-[125px]"
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          step.done && !step.active
                            ? "bg-emerald-600 text-white shadow-xs"
                            : step.active
                              ? "bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse"
                              : "bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700"
                        }`}
                      >
                        {step.done && !step.active ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <p
                        className={`mt-2 text-xs font-semibold leading-tight ${
                          step.active
                            ? "text-amber-600 dark:text-amber-400"
                            : step.done
                              ? "text-gray-900 dark:text-neutral-100"
                              : "text-gray-400 dark:text-neutral-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">{step.time}</p>
                      <p className="text-[10px] text-gray-600 dark:text-neutral-400 font-bold truncate max-w-full">
                        {step.actor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver & Route Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-b border-gray-100 dark:border-neutral-800">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    Armada &amp; Pengemudi
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Truck size={14} className="text-gray-500" />
                    {activeShipmentDetail.courierName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">{activeShipmentDetail.courierVehicle}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                    Telp: {activeShipmentDetail.courierPhone}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    Estimasi Tiba &amp; Tujuan
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    {activeShipmentDetail.eta}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">{activeShipmentDetail.toAddress}</p>
                </div>
              </div>

              {/* Manifest Items List */}
              <div className="py-4 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                    Daftar Muatan Manifest (
                    {activeShipmentDetail.items.reduce((acc, i) => acc + i.qty, 0)} Unit)
                  </p>
                  <span className="text-[11px] text-gray-500">Kondisi: Tersegel Rapi</span>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase text-gray-400 dark:border-neutral-800 dark:bg-neutral-800/40">
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Nama Barang</th>
                        <th className="py-2 px-3 text-right">Jumlah</th>
                        <th className="py-2 px-3">Satuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeShipmentDetail.items.map((it) => (
                        <tr
                          key={it.sku}
                          className="border-b border-gray-50 dark:border-neutral-800/50 text-gray-700 dark:text-neutral-300"
                        >
                          <td className="py-2 px-3 font-mono font-bold text-gray-900 dark:text-neutral-100">
                            {it.sku}
                          </td>
                          <td className="py-2 px-3">{it.name}</td>
                          <td className="py-2 px-3 text-right font-bold">{it.qty}</td>
                          <td className="py-2 px-3 text-gray-500">{it.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${activeShipmentDetail.courierPhone}?text=Halo%20${encodeURIComponent(
                      activeShipmentDetail.courierName,
                    )}%20konfirmasi%20pengiriman%20${activeShipmentDetail.trackingNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 transition-colors"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Driver</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedForPrint(activeShipmentDetail);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak Dokumen</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeShipmentDetail.status === "PACKED" && (
                    <button
                      type="button"
                      onClick={() => handleDispatch(activeShipmentDetail.id, activeShipmentDetail.trackingNo)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Truck size={14} />
                      Serahkan ke Kurir
                    </button>
                  )}

                  {activeShipmentDetail.status === "IN_TRANSIT" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmReceived(activeShipmentDetail.id, activeShipmentDetail.trackingNo)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      Konfirmasi Barang Tiba &amp; Diterima
                    </button>
                  )}

                  {activeShipmentDetail.status === "RECEIVED" && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Selesai &amp; Masuk Stok Cabang
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Surat Jalan Official Print Modal */}
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
                    <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {selectedForPrint.trackingNo}
                    </p>
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
                          <td className="p-2 border border-gray-200 dark:border-neutral-700 text-right font-bold">
                            {it.qty}
                          </td>
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
                    <option value="Bpk. Ahmad Subarjo (Pickup Carry)">
                      Bpk. Ahmad Subarjo — Mobil Pickup Carry (Plat E 4821 YZ)
                    </option>
                    <option value="Bpk. Dedi Supriyadi (Motor Toko)">
                      Bpk. Dedi Supriyadi — Motor Kurir Cepat (Plat E 3190 XY)
                    </option>
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
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
