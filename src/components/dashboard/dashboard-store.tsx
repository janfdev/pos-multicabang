"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Search,
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Mail,
  Zap,
  BarChart3,
  Plug,
  HelpCircle,
  MessageCircle,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Share2,
  Bell,
  Plus,
  Download,
  SlidersHorizontal,
  Star,
  X,
  Info,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  Sun,
  Moon,
  Crown,
  ArrowLeftRight,
  Store,
  Boxes,
  ShoppingBag,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { themeStore } from "@/lib/themeStore";

const font = {
  fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",
} as const;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

type Status =
  | "In Stock"
  | "Out of Stock"
  | "Restock"
  | "Active"
  | "Pending"
  | "Completed"
  | "Cancelled"
  | "Read"
  | "Unread"
  | "Published"
  | "Draft"
  | "New"
  | "In Review"
  | "Resolved"
  | "COMPLETED"
  | "ACTIVE"
  | "RESTOCK"
  | "DISPATCHED"
  | "RECEIVED"
  | "REQUESTED"
  | "PROCESSING"
  | "READY"
  | "CANCELLED"
  | "RETURN"
  | "REBALANCE"
  | "KRITIS"
  | "AMAN"
  | (string & {});

type Row = {
  id: string;
  cells: Record<string, string | number>;
  status: Status;
  rating?: number;
};

type ColumnDef = {
  key: string;
  label: string;
  align?: "left" | "right";
  numeric?: boolean;
};

type Dataset = {
  key: string;
  title: string;
  addLabel: string;
  columns: ColumnDef[];
  stats: { label: string; value: string; delta: string }[];
  rows: Row[];
};

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const MAIN_MENU: NavItem[] = [
  { label: "Dashboard Eksekutif", icon: LayoutGrid },
  { label: "Master Produk & Harga", icon: Package },
  { label: "Monitoring Stok Cabang", icon: Boxes },
  { label: "Mutasi & Retur 2-Arah", icon: ArrowLeftRight },
  { label: "Antrean Pesanan Online", icon: ShoppingBag },
  { label: "Transaksi Kasir POS", icon: Receipt },
];
const TOOLS_MENU: NavItem[] = [
  { label: "Analitik & Laporan", icon: BarChart3 },
  { label: "Log Audit & Cloud", icon: ShieldCheck },
];

const BOTTOM_MENU: NavItem[] = [
  { label: "SOP & Panduan Kasir", icon: HelpCircle },
  { label: "Pengaturan Multi-Outlet", icon: Settings },
];

const WORKSPACES = [
  { label: "Toko 1 (Pusat & Gudang)", count: 797, color: "bg-blue-600 dark:bg-blue-400", outletId: "toko-1" },
  { label: "Toko 2 (Cabang Satelit)", count: 126, color: "bg-emerald-600 dark:bg-emerald-400", outletId: "toko-2" },
  { label: "Konsolidasi Semua Cabang", count: 923, color: "bg-purple-600 dark:bg-purple-400", outletId: "all" },
];

type Tone = "solid" | "subtle" | "outline";
const STATUS_META: Record<string, { tone: Tone }> = {
  "In Stock": { tone: "solid" },
  "Out of Stock": { tone: "outline" },
  Restock: { tone: "subtle" },
  RESTOCK: { tone: "subtle" },
  Active: { tone: "solid" },
  ACTIVE: { tone: "solid" },
  Pending: { tone: "subtle" },
  PENDING: { tone: "subtle" },
  Processing: { tone: "subtle" },
  PROCESSING: { tone: "subtle" },
  Ready: { tone: "solid" },
  READY: { tone: "solid" },
  Completed: { tone: "solid" },
  COMPLETED: { tone: "solid" },
  Cancelled: { tone: "outline" },
  CANCELLED: { tone: "outline" },
  Requested: { tone: "subtle" },
  REQUESTED: { tone: "subtle" },
  Dispatched: { tone: "subtle" },
  DISPATCHED: { tone: "subtle" },
  Received: { tone: "solid" },
  RECEIVED: { tone: "solid" },
  Return: { tone: "outline" },
  RETURN: { tone: "outline" },
  Rebalance: { tone: "subtle" },
  REBALANCE: { tone: "subtle" },
  Read: { tone: "outline" },
  Unread: { tone: "solid" },
  Published: { tone: "solid" },
  PUBLISHED: { tone: "solid" },
  Draft: { tone: "subtle" },
  New: { tone: "solid" },
  "In Review": { tone: "subtle" },
  Resolved: { tone: "solid" },
  RESOLVED: { tone: "solid" },
  KRITIS: { tone: "subtle" },
  AMAN: { tone: "solid" },
};
const TONE_CLASSES: Record<Tone, string> = {
  solid: "bg-gray-900 text-white dark:bg-neutral-50 dark:text-neutral-900",
  subtle:
    "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  outline:
    "bg-white text-gray-400 border border-gray-300 dark:bg-neutral-900 dark:text-neutral-500 dark:border-neutral-700",
};

const AVATARS = [
  {
    id: 1,
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=JK&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=AM&backgroundColor=c0aede",
  },
  {
    id: 3,
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=SL&backgroundColor=ffdfbf",
  },
  {
    id: 4,
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=TR&backgroundColor=d1d4f9",
  },
  {
    id: 5,
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=PW&backgroundColor=ffd5dc",
  },
];

function buildDatasets(): Record<string, Dataset> {
  const ds: Record<string, Dataset> = {
    "Dashboard Eksekutif": {
      key: "Dashboard Eksekutif",
      title: "Dashboard Eksekutif & Analitik Terpadu",
      addLabel: "Tambah Indikator KPI",
      columns: [
        { key: "name", label: "Metrik Bisnis / Kanal" },
        { key: "value", label: "Nilai Real-time" },
        { key: "change", label: "Pertumbuhan" },
        { key: "period", label: "Cakupan Outlet" },
      ],
      stats: [
        { label: "Total Omzet Gabungan", value: "Rp 48.290.000", delta: "+ 14%" },
        { label: "Total Stok Multi-Cabang", value: "923 Unit", delta: "+ 65 unit" },
        { label: "Mutasi In-Transit", value: "1 Pengiriman", delta: "60 unit jalan" },
        { label: "Rasio Offline vs Online", value: "92% : 8%", delta: "Seimbang" },
      ],
      rows: [
        {
          id: "d1",
          status: "COMPLETED",
          cells: {
            name: "Penjualan Toko 1 (Pusat & Gudang)",
            value: "Rp 30.400.000",
            change: "+16%",
            period: "Bulan Berjalan",
          },
        },
        {
          id: "d2",
          status: "COMPLETED",
          cells: {
            name: "Penjualan Toko 2 (Cabang Satelit)",
            value: "Rp 14.040.000",
            change: "+9%",
            period: "Bulan Berjalan",
          },
        },
        {
          id: "d3",
          status: "COMPLETED",
          cells: {
            name: "Penjualan Toko Online (/shop)",
            value: "Rp 3.850.000",
            change: "+24%",
            period: "Bulan Berjalan",
          },
        },
        {
          id: "d4",
          status: "ACTIVE",
          cells: {
            name: "Stok Gudang Toko 1 (Pusat)",
            value: "797 Unit",
            change: "Ready 12 SKU",
            period: "Gudang Pasokan Utama",
          },
        },
        {
          id: "d5",
          status: "RESTOCK",
          cells: {
            name: "Stok Display Toko 2 (Cabang)",
            value: "126 Unit",
            change: "5 SKU Ambang Kritis",
            period: "Cabang Kesambi",
          },
        },
        {
          id: "d6",
          status: "DISPATCHED",
          cells: {
            name: "Mutasi Restock Antar Cabang",
            value: "60 Unit In-Transit",
            change: "Bpk. Ahmad (Armada T1)",
            period: "Rute T1 ➔ T2",
          },
        },
      ],
    },
    "Master Produk & Harga": {
      key: "Master Produk & Harga",
      title: "Master Katalog Produk & Standar Harga Terpusat (PRD 4.1)",
      addLabel: "Tambah Master SKU",
      columns: [
        { key: "sku", label: "Kode SKU" },
        { key: "barcode", label: "Barcode 1D" },
        { key: "name", label: "Nama Produk" },
        { key: "category", label: "Kategori" },
        { key: "unit", label: "Satuan" },
        { key: "costPrice", label: "HPP Modal", numeric: true },
        { key: "sellingPrice", label: "Harga Jual", numeric: true },
        { key: "minAlert", label: "Ambang Alert", numeric: true },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Total Master SKU", value: "12 SKU", delta: "+ 2 baru" },
        { label: "Total Nilai Aset HPP", value: "Rp 33.720.000", delta: "+ 8.5%" },
        { label: "Potensi Omzet Jual", value: "Rp 41.850.000", delta: "Margin 19.4%" },
        { label: "Standar Harga Terpusat", value: "100% Seragam", delta: "T1, T2 & Online" },
      ],
      rows: [
        {
          id: "p1",
          status: "ACTIVE",
          cells: {
            sku: "BRG-001",
            barcode: "89912345601",
            name: "Beras Pandan Wangi 5kg",
            category: "Sembako",
            unit: "SAK",
            costPrice: 65000,
            sellingPrice: 76000,
            minAlert: 6,
          },
        },
        {
          id: "p2",
          status: "ACTIVE",
          cells: {
            sku: "BRG-002",
            barcode: "89912345602",
            name: "Minyak Goreng Sawit 2L",
            category: "Sembako",
            unit: "POUCH",
            costPrice: 31000,
            sellingPrice: 36500,
            minAlert: 10,
          },
        },
        {
          id: "p3",
          status: "ACTIVE",
          cells: {
            sku: "BRG-003",
            barcode: "89912345603",
            name: "Gula Pasir Kristal 1kg",
            category: "Sembako",
            unit: "BKS",
            costPrice: 15000,
            sellingPrice: 17500,
            minAlert: 10,
          },
        },
        {
          id: "p4",
          status: "ACTIVE",
          cells: {
            sku: "BRG-004",
            barcode: "89912345604",
            name: "Tepung Terigu Segitiga 1kg",
            category: "Bahan Kue",
            unit: "BKS",
            costPrice: 11500,
            sellingPrice: 13500,
            minAlert: 8,
          },
        },
        {
          id: "p5",
          status: "ACTIVE",
          cells: {
            sku: "BRG-005",
            barcode: "89912345605",
            name: "Kopi Kapal Api Spesial 165g",
            category: "Minuman",
            unit: "BKS",
            costPrice: 14000,
            sellingPrice: 16500,
            minAlert: 8,
          },
        },
        {
          id: "p6",
          status: "ACTIVE",
          cells: {
            sku: "BRG-006",
            barcode: "89912345606",
            name: "Susu Kental Manis Putih 370g",
            category: "Minuman",
            unit: "KALENG",
            costPrice: 11000,
            sellingPrice: 13000,
            minAlert: 12,
          },
        },
        {
          id: "p7",
          status: "ACTIVE",
          cells: {
            sku: "BRG-007",
            barcode: "89912345607",
            name: "Mie Instan Goreng Spesial",
            category: "Makanan Cepat",
            unit: "DUS",
            costPrice: 108000,
            sellingPrice: 122000,
            minAlert: 5,
          },
        },
        {
          id: "p8",
          status: "ACTIVE",
          cells: {
            sku: "BRG-008",
            barcode: "89912345608",
            name: "Kecap Manis Botol 600ml",
            category: "Bumbu Dapur",
            unit: "BOTOL",
            costPrice: 20000,
            sellingPrice: 24000,
            minAlert: 8,
          },
        },
        {
          id: "p9",
          status: "ACTIVE",
          cells: {
            sku: "BRG-009",
            barcode: "89912345609",
            name: "Sabun Cuci Piring Jeruk Nipis 780ml",
            category: "Kebersihan",
            unit: "POUCH",
            costPrice: 13500,
            sellingPrice: 16000,
            minAlert: 10,
          },
        },
        {
          id: "p10",
          status: "ACTIVE",
          cells: {
            sku: "BRG-010",
            barcode: "89912345610",
            name: "Deterjen Bubuk Konsentrat 800g",
            category: "Kebersihan",
            unit: "BKS",
            costPrice: 17500,
            sellingPrice: 21000,
            minAlert: 8,
          },
        },
        {
          id: "p11",
          status: "ACTIVE",
          cells: {
            sku: "BRG-011",
            barcode: "89912345611",
            name: "Telur Ayam Ras 1 Tray (30 butir)",
            category: "Sembako",
            unit: "TRAY",
            costPrice: 48000,
            sellingPrice: 55000,
            minAlert: 5,
          },
        },
        {
          id: "p12",
          status: "ACTIVE",
          cells: {
            sku: "BRG-012",
            barcode: "89912345612",
            name: "Biskuit Kaleng Aneka Rasa 350g",
            category: "Snack",
            unit: "KALENG",
            costPrice: 38000,
            sellingPrice: 46000,
            minAlert: 6,
          },
        },
      ],
    },
    "Monitoring Stok Cabang": {
      key: "Monitoring Stok Cabang",
      title: "Monitoring Stok Antar-Cabang & Ambang Batas (PRD 4.3)",
      addLabel: "Minta Tambah Pasokan",
      columns: [
        { key: "name", label: "Nama Barang & SKU" },
        { key: "toko1", label: "Stok T1 (Gudang)", numeric: true },
        { key: "toko2", label: "Stok T2 (Cabang)", numeric: true },
        { key: "totalStock", label: "Total Unit", numeric: true },
        { key: "minAlert", label: "Batas Alert", numeric: true },
        { key: "alert", label: "Ambang Batas" },
        { key: "status", label: "Kondisi Stok" },
      ],
      stats: [
        { label: "Total Unit Multi-Cabang", value: "923 Unit", delta: "+ 65 unit" },
        { label: "Stok Gudang Pusat T1", value: "797 Unit", delta: "86.3% aset" },
        { label: "Stok Cabang Satelit T2", value: "126 Unit", delta: "13.7% aset" },
        { label: "Stok Menipis Kritis T2", value: "5 SKU", delta: "Perlu restock" },
      ],
      rows: [
        {
          id: "ms1",
          status: "RESTOCK",
          cells: {
            name: "Beras Pandan Wangi 5kg (BRG-001)",
            toko1: 85,
            toko2: 4,
            totalStock: 89,
            minAlert: 6,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms2",
          status: "RESTOCK",
          cells: {
            name: "Minyak Goreng Sawit 2L (BRG-002)",
            toko1: 120,
            toko2: 3,
            totalStock: 123,
            minAlert: 10,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms3",
          status: "In Stock",
          cells: {
            name: "Gula Pasir Kristal 1kg (BRG-003)",
            toko1: 95,
            toko2: 18,
            totalStock: 113,
            minAlert: 10,
            alert: "AMAN - Stok Cukup",
          },
        },
        {
          id: "ms4",
          status: "RESTOCK",
          cells: {
            name: "Tepung Terigu Segitiga 1kg (BRG-004)",
            toko1: 60,
            toko2: 5,
            totalStock: 65,
            minAlert: 8,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms5",
          status: "In Stock",
          cells: {
            name: "Kopi Kapal Api Spesial 165g (BRG-005)",
            toko1: 50,
            toko2: 14,
            totalStock: 64,
            minAlert: 8,
            alert: "AMAN - Stok Cukup",
          },
        },
        {
          id: "ms6",
          status: "In Stock",
          cells: {
            name: "Susu Kental Manis Putih 370g (BRG-006)",
            toko1: 72,
            toko2: 22,
            totalStock: 94,
            minAlert: 12,
            alert: "AMAN - Stok Cukup",
          },
        },
        {
          id: "ms7",
          status: "RESTOCK",
          cells: {
            name: "Mie Instan Goreng Spesial (BRG-007)",
            toko1: 40,
            toko2: 2,
            totalStock: 42,
            minAlert: 5,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms8",
          status: "In Stock",
          cells: {
            name: "Kecap Manis Botol 600ml (BRG-008)",
            toko1: 65,
            toko2: 16,
            totalStock: 81,
            minAlert: 8,
            alert: "AMAN - Stok Cukup",
          },
        },
        {
          id: "ms9",
          status: "RESTOCK",
          cells: {
            name: "Sabun Cuci Piring Jeruk Nipis 780ml (BRG-009)",
            toko1: 80,
            toko2: 9,
            totalStock: 89,
            minAlert: 10,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms10",
          status: "In Stock",
          cells: {
            name: "Deterjen Bubuk Konsentrat 800g (BRG-010)",
            toko1: 55,
            toko2: 19,
            totalStock: 74,
            minAlert: 8,
            alert: "AMAN - Stok Cukup",
          },
        },
        {
          id: "ms11",
          status: "RESTOCK",
          cells: {
            name: "Telur Ayam Ras 1 Tray (30 butir) (BRG-011)",
            toko1: 30,
            toko2: 3,
            totalStock: 33,
            minAlert: 5,
            alert: "KRITIS - Perlu Pasokan",
          },
        },
        {
          id: "ms12",
          status: "In Stock",
          cells: {
            name: "Biskuit Kaleng Aneka Rasa 350g (BRG-012)",
            toko1: 45,
            toko2: 11,
            totalStock: 56,
            minAlert: 6,
            alert: "AMAN - Stok Cukup",
          },
        },
      ],
    },
    "Mutasi & Retur 2-Arah": {
      key: "Mutasi & Retur 2-Arah",
      title: "Mutasi Barang Dua Arah & Tracking Status (PRD 4.4)",
      addLabel: "Ajukan Dokumen Mutasi",
      columns: [
        { key: "name", label: "No. Mutasi" },
        { key: "type", label: "Tipe Mutasi" },
        { key: "route", label: "Rute Pengiriman" },
        { key: "items", label: "Rincian Barang" },
        { key: "courier", label: "Kurir / PIC" },
        { key: "status", label: "Status 3-Tahap" },
      ],
      stats: [
        { label: "Total Mutasi Bulan Ini", value: "18 Dokumen", delta: "+ 4" },
        { label: "In-Transit Sedang Jalan", value: "1 Pengiriman", delta: "60 unit" },
        { label: "Selesai Diterima Cabang", value: "16 Mutasi", delta: "Stok aman" },
        { label: "Dokumen Retur Rusak", value: "1 Retur Selesai", delta: "T2 ➔ T1" },
      ],
      rows: [
        {
          id: "mut1",
          status: "DISPATCHED",
          cells: {
            name: "#MUT-20261029-001",
            type: "RESTOCK (Pasokan Rutin)",
            route: "Toko 1 (Gudang) ➔ Toko 2 (Cabang)",
            items: "Beras 20 sak, Minyak 30 pch, Mie 10 dus",
            courier: "Ahmad (Armada Gudang Pusat)",
          },
        },
        {
          id: "mut2",
          status: "RECEIVED",
          cells: {
            name: "#MUT-20261028-002",
            type: "RESTOCK (Pasokan Rutin)",
            route: "Toko 1 (Gudang) ➔ Toko 2 (Cabang)",
            items: "Gula Pasir 25 bks, Sabun Cuci 20 pch",
            courier: "Ahmad (Armada Gudang Pusat)",
          },
        },
        {
          id: "mut3",
          status: "RECEIVED",
          cells: {
            name: "#RET-20261026-004",
            type: "RETURN (Kemasan Rusak)",
            route: "Toko 2 (Cabang) ➔ Toko 1 (Gudang)",
            items: "Biskuit Kaleng 2 kaleng (Penyok ekspedisi)",
            courier: "Doni (Kurir Toko 2)",
          },
        },
        {
          id: "mut4",
          status: "RECEIVED",
          cells: {
            name: "#MUT-20261027-003",
            type: "RESTOCK (Pasokan Rutin)",
            route: "Toko 1 (Gudang) ➔ Toko 2 (Cabang)",
            items: "Tepung Terigu 15 bks, Kopi 20 bks",
            courier: "Ahmad (Armada Gudang Pusat)",
          },
        },
        {
          id: "mut5",
          status: "REQUESTED",
          cells: {
            name: "#MUT-20261029-005",
            type: "RESTOCK (Minta Tambah)",
            route: "Toko 1 (Gudang) ➔ Toko 2 (Cabang)",
            items: "Beras Pandan 10 sak, Telur 5 tray",
            courier: "Belum Ditugaskan",
          },
        },
      ],
    },
    "Antrean Pesanan Online": {
      key: "Antrean Pesanan Online",
      title: "Antrean Manajemen Pesanan Online Masuk (PRD 4.5 & 4.6)",
      addLabel: "Input Pesanan Online",
      columns: [
        { key: "name", label: "No. Pesanan" },
        { key: "customer", label: "Pembeli & WhatsApp" },
        { key: "outlet", label: "Cabang Pemenuhan" },
        { key: "service", label: "Layanan" },
        { key: "items", label: "Rincian Belanja" },
        { key: "total", label: "Total Pembayaran", numeric: true },
        { key: "status", label: "Status 5-Tahap" },
      ],
      stats: [
        { label: "Total Pesanan Online", value: "28 Order", delta: "Rp 3.850.000" },
        { label: "Menunggu Verifikasi", value: "1 Order", delta: "PENDING" },
        { label: "Sedang Dipacking", value: "1 Order", delta: "PROCESSING" },
        { label: "Siap Diambil / Kirim", value: "1 Order", delta: "READY" },
      ],
      rows: [
        {
          id: "onl1",
          status: "COMPLETED",
          cells: {
            name: "#ONL-20261119-001",
            customer: "Hendra Wijaya (0812-9988-7766)",
            outlet: "Toko 1 (Pusat & Gudang)",
            service: "Ambil di Toko (Pickup)",
            items: "Beras Pandan 5kg, Minyak Sawit 2L",
            total: 150000,
          },
        },
        {
          id: "onl2",
          status: "PROCESSING",
          cells: {
            name: "#ONL-20261119-002",
            customer: "Ibu Rina Melati (0813-2233-4455)",
            outlet: "Toko 2 (Cabang Kesambi)",
            service: "Kirim Kurir (Delivery - Kesambi 12)",
            items: "Beras Pandan Wangi 5kg",
            total: 76000,
          },
        },
        {
          id: "onl3",
          status: "PENDING",
          cells: {
            name: "#ONL-20261119-003",
            customer: "Dimas Pratama (0857-1122-3344)",
            outlet: "Toko 2 (Cabang Kesambi)",
            service: "Ambil di Toko (Pickup)",
            items: "Mie Instan 1 Dus, Gula Pasir 2kg",
            total: 157000,
          },
        },
        {
          id: "onl4",
          status: "READY",
          cells: {
            name: "#ONL-20261119-004",
            customer: "Resto Sedap Rasa (0811-3344-5566)",
            outlet: "Toko 1 (Pusat & Gudang)",
            service: "Kirim Kurir (Delivery - Pemuda 88)",
            items: "Minyak Sawit 5 pouch, Telur 2 tray",
            total: 292500,
          },
        },
        {
          id: "onl5",
          status: "COMPLETED",
          cells: {
            name: "#ONL-20261118-005",
            customer: "Siti Rahma (0819-3344-5566)",
            outlet: "Toko 1 (Pusat & Gudang)",
            service: "Ambil di Toko (Pickup)",
            items: "Kopi Kapal Api 2, Susu Kental 3",
            total: 72000,
          },
        },
      ],
    },
    "Transaksi Kasir POS": {
      key: "Transaksi Kasir POS",
      title: "Riwayat Transaksi Kasir Ritel POS (PRD 4.2)",
      addLabel: "Buka Layar Kasir",
      columns: [
        { key: "name", label: "No. Struk Kasir" },
        { key: "outlet", label: "Outlet Kasir" },
        { key: "cashier", label: "Kasir / Shift" },
        { key: "payment", label: "Metode Bayar" },
        { key: "items", label: "Item Belanja" },
        { key: "total", label: "Total Transaksi", numeric: true },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Total Transaksi POS", value: "1.204 Trx", delta: "+ 18%" },
        { label: "Total Omzet Kasir", value: "Rp 44.440.000", delta: "+ 12%" },
        { label: "Pembayaran Tunai", value: "762 Trx", delta: "63% transaksi" },
        { label: "Pembayaran QRIS", value: "442 Trx", delta: "37% transaksi" },
      ],
      rows: [
        {
          id: "trx1",
          status: "COMPLETED",
          cells: {
            name: "#TRX-1029-0820",
            outlet: "Toko 1 (Pusat & Gudang)",
            cashier: "Kasir Siti (Shift Pagi)",
            payment: "Tunai (Cash Rp 200.000, Kembali Rp 11.500)",
            items: "3 item (Beras, Minyak, Telur)",
            total: 188500,
          },
        },
        {
          id: "trx2",
          status: "COMPLETED",
          cells: {
            name: "#TRX-1029-0831",
            outlet: "Toko 2 (Cabang Kesambi)",
            cashier: "Kasir Rian (Shift Pagi)",
            payment: "QRIS Dinamis (Terverifikasi)",
            items: "2 item (Minyak Goreng, Gula Pasir)",
            total: 49500,
          },
        },
        {
          id: "trx3",
          status: "COMPLETED",
          cells: {
            name: "#TRX-1029-0904",
            outlet: "Toko 1 (Pusat & Gudang)",
            cashier: "Kasir Budi (Shift Siang)",
            payment: "Tunai (Cash Rp 200.000, Kembali Rp 2.000)",
            items: "4 item (Minyak 2, Telur 1, Kecap 1)",
            total: 198000,
          },
        },
        {
          id: "trx4",
          status: "COMPLETED",
          cells: {
            name: "#TRX-1029-0915",
            outlet: "Toko 1 (Pusat & Gudang)",
            cashier: "Kasir Siti (Shift Sore)",
            payment: "Tunai (Grosir Warung Bu Siti)",
            items: "8 item (Sembako Lengkap)",
            total: 340000,
          },
        },
        {
          id: "trx5",
          status: "COMPLETED",
          cells: {
            name: "#TRX-1029-0932",
            outlet: "Toko 2 (Cabang Kesambi)",
            cashier: "Kasir Rian (Shift Sore)",
            payment: "QRIS Dinamis (Terverifikasi)",
            items: "3 item (Sabun Cuci, Deterjen, Kopi)",
            total: 53500,
          },
        },
      ],
    },
    "Analitik & Laporan": {
      key: "Analitik & Laporan",
      title: "Analitik & Perbandingan Kinerja Multi-Cabang (PRD 4.7)",
      addLabel: "Export Rekap Laporan",
      columns: [
        { key: "name", label: "Indikator Kinerja Bisnis" },
        { key: "toko1", label: "Toko 1 (Pusat & Gudang)" },
        { key: "toko2", label: "Toko 2 (Cabang Satelit)" },
        { key: "online", label: "Toko Online /shop" },
        { key: "total", label: "Total Konsolidasi" },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Total Omzet Konsolidasi", value: "Rp 48.290.000", delta: "+ 14%" },
        { label: "Rata-rata Margin Kotor", value: "19.4%", delta: "+ 1.2%" },
        { label: "Ketersediaan Stok (SLA)", value: "96.8%", delta: "Optimal" },
        { label: "Perputaran Persediaan", value: "8.2x", delta: "/ bulan" },
      ],
      rows: [
        {
          id: "an1",
          status: "COMPLETED",
          cells: {
            name: "Omzet Penjualan Kotor",
            toko1: "Rp 30.400.000",
            toko2: "Rp 14.040.000",
            online: "Rp 3.850.000",
            total: "Rp 48.290.000",
          },
        },
        {
          id: "an2",
          status: "COMPLETED",
          cells: {
            name: "Volume Transaksi (Trx)",
            toko1: "760 Trx",
            toko2: "416 Trx",
            online: "28 Trx",
            total: "1.204 Trx",
          },
        },
        {
          id: "an3",
          status: "ACTIVE",
          cells: {
            name: "Fisik Persediaan Barang",
            toko1: "797 Unit",
            toko2: "126 Unit",
            online: "(Buffer T1)",
            total: "923 Unit",
          },
        },
        {
          id: "an4",
          status: "RESTOCK",
          cells: {
            name: "SKU Menipis Ambang Kritis",
            toko1: "0 SKU",
            toko2: "5 SKU",
            online: "-",
            total: "5 SKU Perlu Restock",
          },
        },
        {
          id: "an5",
          status: "ACTIVE",
          cells: {
            name: "Nilai Aset Persediaan (HPP)",
            toko1: "Rp 29.180.000",
            toko2: "Rp 4.540.000",
            online: "-",
            total: "Rp 33.720.000",
          },
        },
      ],
    },
    "Log Audit & Cloud": {
      key: "Log Audit & Cloud",
      title: "Log Audit Sistem, Arsitektur & Koneksi Cloud (PRD Section 2 & 5)",
      addLabel: "Audit Kesehatan Sistem",
      columns: [
        { key: "name", label: "Modul / Subsistem" },
        { key: "category", label: "Arsitektur" },
        { key: "syncedAt", label: "Status Kondisi" },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Latency Vercel Edge", value: "< 20ms", delta: "Optimal" },
        { label: "Atomic Concurrency", value: "100% Aman", delta: "Zero oversell" },
        { label: "Anti-Slop Design", value: "100% Sesuai PRD", delta: "Linear / BagUI" },
        { label: "Uptime Cloud Serverless", value: "99.98%", delta: "Normal" },
      ],
      rows: [
        {
          id: "log1",
          status: "ACTIVE",
          cells: {
            name: "Vercel Serverless Edge Runtime (/api/*)",
            category: "Cloud Infrastructure",
            syncedAt: "Aktif & Cepat (<20ms latency)",
          },
        },
        {
          id: "log2",
          status: "ACTIVE",
          cells: {
            name: "In-Memory Atomic Stock Ledger Engine",
            category: "Concurrency Isolation",
            syncedAt: "Atomic deduction & rollback protection",
          },
        },
        {
          id: "log3",
          status: "ACTIVE",
          cells: {
            name: "Web Store Etalase Publik (/shop)",
            category: "Omnichannel E-Commerce",
            syncedAt: "Terhubung live ke stok outlet terdekat",
          },
        },
        {
          id: "log4",
          status: "ACTIVE",
          cells: {
            name: "Kasir POS Web Application (/)",
            category: "Point of Sale",
            syncedAt: "Mendukung desktop, tablet, dan smartphone",
          },
        },
        {
          id: "log5",
          status: "ACTIVE",
          cells: {
            name: "ESC-POS Digital Receipt Engine",
            category: "Hardware Printing",
            syncedAt: "Standar struk digital 58mm/80mm",
          },
        },
      ],
    },
    "SOP & Panduan Kasir": {
      key: "SOP & Panduan Kasir",
      title: "Standar Operasional Prosedur (SOP) Kasir & Gudang (PRD 4.4 & 4.6)",
      addLabel: "Tambah SOP Baru",
      columns: [
        { key: "name", label: "Dokumen SOP Operasional" },
        { key: "category", label: "Peran Target" },
        { key: "views", label: "Dibaca Staf" },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Dokumen SOP", value: "5 SOP Resmi", delta: "Terverifikasi" },
        { label: "Topik Terpopuler", value: "Mutasi 3-Tahap", delta: "420x dibaca" },
        { label: "Kepatuhan Staf", value: "100%", delta: "Disiplin" },
        { label: "Review Berkala", value: "Bulan Berjalan", delta: "Up to date" },
      ],
      rows: [
        {
          id: "sop1",
          status: "PUBLISHED",
          cells: {
            name: "SOP Mutasi Pasokan 3-Tahap (Requested ➔ Dispatched ➔ Received)",
            category: "Gudang & Logistik",
            views: "420x",
          },
        },
        {
          id: "sop2",
          status: "PUBLISHED",
          cells: {
            name: "SOP Kasir: Barcode Scanner, Keranjang, dan Hitung Kembalian Tunai",
            category: "Kasir POS",
            views: "380x",
          },
        },
        {
          id: "sop3",
          status: "PUBLISHED",
          cells: {
            name: "SOP Pemrosesan Order Online /shop (Pending ➔ Processing ➔ Ready)",
            category: "Kasir & Fulfillment",
            views: "290x",
          },
        },
        {
          id: "sop4",
          status: "PUBLISHED",
          cells: {
            name: "SOP Penanganan Retur Barang Cacat atau Expired (Toko 2 ➔ Toko 1)",
            category: "Gudang Cabang T2",
            views: "195x",
          },
        },
        {
          id: "sop5",
          status: "PUBLISHED",
          cells: {
            name: "SOP Verifikasi QRIS Dinamis dan Penyerahan Struk Digital",
            category: "Kasir POS",
            views: "310x",
          },
        },
      ],
    },
    "Pengaturan Multi-Outlet": {
      key: "Pengaturan Multi-Outlet",
      title: "Konfigurasi Master Multi-Outlet & Otoritas Akses (PRD 1 & 3)",
      addLabel: "Tambah Konfigurasi",
      columns: [
        { key: "name", label: "Nama Pengaturan" },
        { key: "value", label: "Nilai Konfigurasi" },
        { key: "category", label: "Kategori" },
        { key: "status", label: "Status" },
      ],
      stats: [
        { label: "Total Cabang Fisik", value: "2 Outlet", delta: "Pusat & Cabang" },
        { label: "Akun Persona", value: "3 Akun Staf", delta: "Owner, T1, T2" },
        { label: "Auto-Fill Login", value: "Aktif 1-Klik", delta: "Praktis" },
        { label: "Mata Uang Standar", value: "IDR (Rupiah Rp)", delta: "Standar ID" },
      ],
      rows: [
        {
          id: "set1",
          status: "ACTIVE",
          cells: {
            name: "Toko 1: Gudang Utama & Penjualan Ritel",
            value: "Jl. Pemuda No. 12, Cirebon (T1-PUSAT)",
            category: "Topologi Outlet",
          },
        },
        {
          id: "set2",
          status: "ACTIVE",
          cells: {
            name: "Toko 2: Cabang Satelit & Penjualan Ritel",
            value: "Jl. Kesambi No. 45, Cirebon (T2-CABANG)",
            category: "Topologi Outlet",
          },
        },
        {
          id: "set3",
          status: "ACTIVE",
          cells: {
            name: "Sistem Desain Linear & BagUI Dark/Light Mode",
            value: "Sinkronisasi otomatis ke seluruh modul",
            category: "Tampilan & UX",
          },
        },
        {
          id: "set4",
          status: "ACTIVE",
          cells: {
            name: "Ambang Batas Minimum Alert Restock Cabang",
            value: "Berjalan otomatis sesuai kolom minAlert per SKU",
            category: "Kontrol Stok",
          },
        },
      ],
    },
  };

  // Backwards-compatible aliases
  ds["Dashboard"] = ds["Dashboard Eksekutif"];
  ds["Product"] = ds["Master Produk & Harga"];
  ds["Order"] = ds["Transaksi Kasir POS"];
  ds["Customer"] = ds["Antrean Pesanan Online"];
  ds["Analytics"] = ds["Analitik & Laporan"];
  ds["Settings"] = ds["Pengaturan Multi-Outlet"];
  ds["Help center"] = ds["SOP & Panduan Kasir"];

  return ds;
}

type Toast = { id: number; message: string };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const push = (message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  };
  return { toasts, push };
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-30 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg dark:border dark:border-neutral-700 dark:bg-neutral-800"
          >
            <CheckCircle2 size={15} className="text-green-300" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked
          ? "bg-gray-900 dark:bg-neutral-50"
          : "bg-gray-200 dark:bg-neutral-700"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="h-4 w-4 rounded-full bg-white shadow-sm dark:bg-neutral-900"
        style={{ marginLeft: checked ? "18px" : "2px" }}
      />
    </button>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 cursor-pointer ${
        checked
          ? "border-gray-900 bg-gray-900 dark:border-neutral-100 dark:bg-neutral-100"
          : "border-gray-300 bg-white hover:border-gray-400 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-neutral-500"
      }`}
    >
      {checked && (
        <Check
          size={11}
          className="text-white dark:text-neutral-900"
          strokeWidth={3}
        />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { tone: "subtle" as Tone };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[meta.tone]}`}
    >
      {meta.tone === "solid" && <Check size={11} strokeWidth={3} />}
      {status}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star
        size={13}
        className="fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function Dropdown({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer ${
          value !== "All" && value !== "Default"
            ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
            : ""
        }`}
      >
        <Icon size={14} className="text-gray-400 dark:text-neutral-500" />
        {value === "All" || value === "Default" ? label : value}
        <ChevronDown
          size={14}
          className="text-gray-400 dark:text-neutral-500"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 ${
                  value === o
                    ? "font-medium text-gray-900 dark:text-neutral-50"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                {o}
                {value === o && <Check size={13} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer ${
        active
          ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-50"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-active-bar"
          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gray-900 dark:bg-neutral-50"
        />
      )}
      <Icon
        size={16}
        className={
          active
            ? "text-gray-900 dark:text-neutral-50"
            : "text-gray-400 dark:text-neutral-500"
        }
      />
      {item.label}
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
      {children}
    </p>
  );
}

function Sidebar({
  active,
  onActiveChange,
  search,
  setSearch,
  onUpgrade,
  onLearnMore,
  onSelectWorkspace,
}: {
  active: string;
  onActiveChange: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  onUpgrade: () => void;
  onLearnMore: () => void;
  onSelectWorkspace?: (label: string) => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex h-full w-64 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-neutral-800 dark:bg-black"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3 rounded-xl px-1.5 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black text-xs shadow-xs">
            POS
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-neutral-50">
                POS Multi-Cabang
              </p>
              <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                BagUI
              </span>
            </div>
            <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400">
              Pro Store Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-lg bg-gray-100 py-2 pl-8 pr-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
              ⌘K
            </span>
          )}
        </div>
      </div>

      <motion.nav
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <SectionLabel>Main Menu</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {MAIN_MENU.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={active === item.label}
              onClick={() => onActiveChange(item.label)}
            />
          ))}
        </div>

        <SectionLabel>Tools</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {TOOLS_MENU.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={active === item.label}
              onClick={() => onActiveChange(item.label)}
            />
          ))}
        </div>

        <SectionLabel>Akses Cepat Kasir</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <a
            href="/"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <ShoppingCart size={16} className="text-gray-400 dark:text-neutral-500" />
            <span className="flex-1 text-left">Terminal Kasir POS</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </a>
          <a
            href="/shop"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Store size={16} className="text-gray-400 dark:text-neutral-500" />
              <span>Toko Online /shop</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </a>
        </div>

        <SectionLabel>Workspace Multi-Cabang</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {WORKSPACES.map((w) => (
            <motion.button
              key={w.label}
              variants={fadeUp}
              onClick={() => onSelectWorkspace?.(w.label)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 cursor-pointer transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${w.color}`} />
              <span className="flex-1 text-left truncate">{w.label}</span>
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                {w.count} unit
              </span>
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <div className="flex flex-col gap-0.5 border-t border-gray-100 px-3 py-4 dark:border-neutral-800">
        {BOTTOM_MENU.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            active={active === item.label}
            onClick={() => onActiveChange(item.label)}
          />
        ))}

        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Vercel Edge Live
            </span>
            <span className="text-[10px] font-mono text-gray-400">&lt;20ms</span>
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
            Multi-Outlet Sync
          </p>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
            Toko 1 &amp; Toko 2 terhubung real-time
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

function AvatarStack() {
  /* eslint-disable @next/next/no-img-element -- These avatars are generated SVGs. */
  return (
    <div className="flex items-center -space-x-2">
      {AVATARS.map((a) => (
        <img
          key={a.id}
          src={a.src}
          alt="Team member avatar"
          className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 object-cover dark:border-black dark:bg-neutral-800"
        />
      ))}
    </div>
  );
  /* eslint-enable @next/next/no-img-element */
}

function ThemeToggle({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
      transition={{
        layout: { duration: 0.25 },
      }}
    >
      <motion.button
        type="button"
        onClick={() => setDarkMode(false)}
        aria-label="Switch to light mode"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.15 }}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center ${
          darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-900"
        }`}
      >
        <AnimatePresence mode="wait">
          {!darkMode && (
            <motion.div
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <Toggle checked={darkMode} onChange={setDarkMode} />

      <motion.button
        type="button"
        onClick={() => setDarkMode(true)}
        aria-label="Switch to dark mode"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.15 }}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center ${
          darkMode ? "text-gray-50" : "text-gray-300 hover:text-gray-500"
        }`}
      >
        <AnimatePresence mode="wait">
          {darkMode && (
            <motion.div
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

function TopBar({
  title,
  onShare,
  onCustomizeWidget,
  notifCount,
  onBell,
  darkMode,
  setDarkMode,
}: {
  title: string;
  onShare: () => void;
  onCustomizeWidget: () => void;
  notifCount: number;
  onBell: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-neutral-800">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-50">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <button
          onClick={onShare}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={onBell}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
        >
          <Bell size={20} />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white dark:bg-red-500 dark:text-white">
              {notifCount}
            </span>
          )}
        </button>
        <AvatarStack />
        <span className="h-6 w-px bg-gray-200 dark:bg-neutral-700" />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCustomizeWidget}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
        >
          <SlidersHorizontal size={14} />
          Customize Widget
        </motion.button>
      </div>
    </div>
  );
}

function Toolbar({
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
  statusOptions,
  showStats,
  setShowStats,
  onCustomize,
  onExport,
  onAdd,
  addLabel,
}: {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortOption: string;
  setSortOption: (v: string) => void;
  statusOptions: string[];
  showStats: boolean;
  setShowStats: (v: boolean) => void;
  onCustomize: () => void;
  onExport: () => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
          <LayoutGrid
            size={14}
            className="text-gray-400 dark:text-neutral-500"
          />
          Table View
          <ChevronDown
            size={14}
            className="text-gray-400 dark:text-neutral-500"
          />
        </button>

        <Dropdown
          label="Filter"
          icon={Filter}
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Dropdown
          label="Sort"
          icon={ArrowUpDown}
          options={["Default", "Name (A-Z)", "Name (Z-A)"]}
          value={sortOption}
          onChange={setSortOption}
        />

        <div className="ml-1 flex items-center gap-2 rounded-lg px-3 py-1.5">
          <span className="text-sm font-medium text-gray-600 dark:text-neutral-300">
            Show Statistics
          </span>
          <Toggle checked={showStats} onChange={setShowStats} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCustomize}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <SlidersHorizontal
            size={14}
            className="text-gray-400 dark:text-neutral-500"
          />
          Customize
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <Download size={14} className="text-gray-400 dark:text-neutral-500" />
          Export
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
        >
          <Plus size={14} />
          {addLabel}
        </motion.button>
      </div>
    </div>
  );
}

function StatsRow({
  stats,
  visible,
  focused,
  setFocused,
}: {
  stats: { label: string; value: string; delta: string }[];
  visible: boolean[];
  focused: string | null;
  setFocused: (v: string | null) => void;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 px-6 pt-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((s, i) =>
        visible[i] ? (
          <motion.button
            key={s.label}
            variants={fadeUp}
            onClick={() => setFocused(focused === s.label ? null : s.label)}
            className={`rounded-xl border p-4 text-left transition-colors duration-150 ${
              focused === s.label
                ? "border-gray-900 bg-gray-50 dark:border-neutral-100 dark:bg-neutral-800"
                : "border-gray-100 bg-white hover:border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-neutral-500">
              {s.label}
              <Info size={12} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-neutral-50">
              {s.value}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500">
              vs last month
              <span
                className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-medium ${
                  s.delta.trim().startsWith("-")
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                    : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-400"
                }`}
              >
                {s.delta.trim().startsWith("-") ? (
                  <ArrowDownRight size={11} />
                ) : (
                  <ArrowUpRight size={11} />
                )}
                {s.delta}
              </span>
            </div>
          </motion.button>
        ) : null,
      )}
    </motion.div>
  );
}

function CustomizePopover({
  columns,
  visibleCols,
  toggleCol,
  onClose,
}: {
  columns: string[];
  visibleCols: Record<string, boolean>;
  toggleCol: (c: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      className="absolute right-6 top-16 z-20 w-56 rounded-lg border border-gray-100 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
        Visible columns
      </p>
      {columns.map((c) => {
        const checked = visibleCols[c] !== false;
        return (
          <div
            key={c}
            role="button"
            tabIndex={0}
            onClick={() => toggleCol(c)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && toggleCol(c)
            }
            className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {c}
            <span
              aria-hidden
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                checked
                  ? "border-gray-900 bg-gray-900 dark:border-neutral-100 dark:bg-neutral-100"
                  : "border-gray-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
              }`}
            >
              {checked && (
                <Check
                  size={11}
                  className="text-white dark:text-neutral-900"
                  strokeWidth={3}
                />
              )}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

function ProductTable({
  columns,
  rows,
  visibleCols,
  selected,
  toggleRow,
  toggleAll,
  sortKey,
  sortDir,
  onSortColumn,
  editingId,
  editValue,
  setEditValue,
  onCommitEdit,
}: {
  columns: ColumnDef[];
  rows: Row[];
  visibleCols: Record<string, boolean>;
  selected: Set<string>;
  toggleRow: (id: string) => void;
  toggleAll: () => void;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onSortColumn: (key: string) => void;
  editingId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  onCommitEdit: () => void;
}) {
  const cols = columns.filter((c) => visibleCols[c.label] !== false);
  const allChecked = rows.length > 0 && selected.size === rows.length;

  return (
    <div className="overflow-hidden overflow-x-auto rounded-xl border border-gray-100 dark:border-neutral-800">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-neutral-800 dark:bg-neutral-900/40">
            <th className="w-10 py-3 pl-4">
              <Checkbox checked={allChecked} onChange={toggleAll} />
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className="py-3 pr-4 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500"
              >
                <button
                  onClick={() => onSortColumn(c.key)}
                  className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-neutral-300"
                >
                  {c.label}
                  {sortKey === c.key ? (
                    sortDir === "asc" ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ChevronsUpDown size={11} className="opacity-40" />
                  )}
                </button>
              </th>
            ))}
            <th className="w-10 py-3 pr-4 text-right">
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-800">
                <Plus size={13} />
              </button>
            </th>
          </tr>
        </thead>
        <motion.tbody variants={stagger} initial="hidden" animate="visible">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={cols.length + 2}
                className="px-4 py-10 text-center text-sm text-gray-400 dark:text-neutral-500"
              >
                No results match your search/filter.
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const isSelected = selected.has(r.id);
            const isEditing = editingId === r.id;
            return (
              <motion.tr
                key={r.id}
                layout
                variants={fadeUp}
                className={`border-b border-gray-50 text-sm transition-colors duration-150 dark:border-neutral-800/60 cursor-pointer ${
                  isSelected
                    ? "border-l-4 border-l-gray-900 bg-gray-50 dark:border-l-neutral-50 dark:bg-neutral-800/50"
                    : "hover:bg-gray-50/60 dark:hover:bg-neutral-800/40"
                }`}
              >
                <td className="py-3 pl-4">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleRow(r.id)}
                  />
                </td>
                {cols.map((c, i) => {
                  if (c.key === "status") {
                    return (
                      <td key={c.key} className="py-3 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                    );
                  }
                  if (c.key === "alert") {
                    const isKritis = String(r.cells[c.key]).includes("KRITIS");
                    return (
                      <td key={c.key} className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isKritis
                              ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${isKritis ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                          {String(r.cells[c.key])}
                        </span>
                      </td>
                    );
                  }
                  if (c.key === "rating" && r.rating !== undefined) {
                    return (
                      <td key={c.key} className="py-3 pr-4">
                        <RatingStars rating={r.rating} />
                      </td>
                    );
                  }
                  const raw = r.cells[c.key];
                  const isMoney = [
                    "price",
                    "revenue",
                    "spent",
                    "total",
                    "costPrice",
                    "sellingPrice",
                  ].includes(c.key);
                  const isUnit = [
                    "toko1",
                    "toko2",
                    "totalStock",
                    "stock",
                    "minAlert",
                  ].includes(c.key);
                  const display =
                    typeof raw === "number" && isMoney
                      ? `Rp ${raw.toLocaleString('id-ID')}`
                      : typeof raw === "number" && isUnit
                        ? `${raw} unit`
                        : (raw ?? "—");
                  if (i === 0 && isEditing) {
                    return (
                      <td key={c.key} className="py-2 pr-4">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && onCommitEdit()}
                          onBlur={onCommitEdit}
                          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
                        />
                      </td>
                    );
                  }
                  return (
                    <td
                      key={c.key}
                      className={`py-3 pr-4 ${
                        i === 0
                          ? "font-medium text-gray-800 dark:text-neutral-200"
                          : "text-gray-500 dark:text-neutral-400"
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
                <td />
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}

function BulkActionBar({
  count,
  onClear,
  onApplyCode,
  onEditInfo,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onApplyCode: () => void;
  onEditInfo: () => void;
  onDelete: () => void;
}) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="sticky bottom-4 z-10 mx-auto flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">
            {count} Selected
          </span>
          <span className="h-4 w-px bg-gray-200 dark:bg-neutral-700" />
          <button
            onClick={onApplyCode}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            Apply Code
          </button>
          <button
            onClick={onEditInfo}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            Edit Info
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-sm font-medium text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 size={13} />
            Delete
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-800">
            <MoreHorizontal size={15} />
          </button>
          <button
            onClick={onClear}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-800"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalRows,
}: {
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  totalRows: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const [goTo, setGoTo] = useState("");
  const [sizeOpen, setSizeOpen] = useState(false);

  const pageList: (number | string)[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      pageList.push(p);
    else if (pageList[pageList.length - 1] !== "…") pageList.push("…");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4 text-sm text-gray-500 dark:text-neutral-400">
      <div className="relative flex items-center gap-2">
        Showing per page
        <button
          onClick={() => setSizeOpen((o) => !o)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {pageSize}
          <ChevronsUpDown
            size={13}
            className="text-gray-400 dark:text-neutral-500"
          />
        </button>
        <AnimatePresence>
          {sizeOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute bottom-full left-24 mb-1 w-20 overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setPageSize(n);
                    setPage(1);
                    setSizeOpen(false);
                  }}
                  className="block w-full rounded-md px-2 py-1 text-left hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  {n}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-40 dark:text-neutral-500 dark:hover:bg-neutral-800"
        >
          <ChevronLeft size={15} />
        </button>
        {pageList.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => setPage(p)}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                page === p
                  ? "bg-gray-900 text-white dark:bg-neutral-50 dark:text-neutral-900"
                  : "text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-1 text-gray-300 dark:text-neutral-600">
              {p}
            </span>
          ),
        )}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-40 dark:text-neutral-500 dark:hover:bg-neutral-800"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        Go to page
        <input
          value={goTo}
          onChange={(e) => setGoTo(e.target.value.replace(/\D/g, ""))}
          className="w-12 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-gray-700 outline-none focus:border-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
        />
        <button
          onClick={() => {
            const n = parseInt(goTo, 10);
            if (n >= 1 && n <= totalPages) setPage(n);
            setGoTo("");
          }}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Go
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard2() {
  const [datasets, setDatasets] = useState<Record<string, Dataset>>(() =>
    buildDatasets(),
  );
  const [active, setActive] = useState("Dashboard Eksekutif");
  const [darkMode, setDarkMode] = useState(() => themeStore.getTheme() === 'dark');

  useEffect(() => {
    return themeStore.subscribe((t) => setDarkMode(t === 'dark'));
  }, []);

  const handleToggleDark = (toDark: boolean) => {
    setDarkMode(toDark);
    themeStore.setTheme(toDark ? 'dark' : 'light');
  };

  const [showStats, setShowStats] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Default");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set(["p1", "p2"]));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({});
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [focusedStat, setFocusedStat] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toasts, push } = useToasts();

  const handleSelectWorkspace = (label: string) => {
    push(`Beralih ke workspace: ${label}`);
    if (label.includes("Toko 1")) {
      setSearch("Toko 1");
    } else if (label.includes("Toko 2")) {
      setSearch("Toko 2");
    } else {
      setSearch("");
    }
  };

  // `active` is normally guaranteed to match a key in `datasets` (every nav
  // item's label has a matching entry from buildDatasets()). This fallback
  // is what actually prevents the crash if the two ever drift apart — e.g. a
  // sidebar item gets added/renamed without a matching dataset entry.
  const dataset = datasets[active] ?? Object.values(datasets)[0];

  if (!datasets[active] && process.env.NODE_ENV !== "production") {
    console.warn(
      `[Dashboard2] No dataset found for nav item "${active}" — falling back to "${dataset.key}". Add a matching entry in buildDatasets().`,
    );
  }

  const handleActiveChange = (nextActive: string) => {
    if (nextActive === active) return;

    setActive(nextActive);
    setSearch("");
    setStatusFilter("All");
    setSortOption("Default");
    setSortKey(null);
    setSelected(new Set());
    setPage(1);
    setFocusedStat(null);
    setCustomizeOpen(false);
    setVisibleCols({});
  };

  const statusOptions = useMemo(
    () => ["All", ...Array.from(new Set(dataset.rows.map((r) => r.status)))],
    [dataset],
  );
  const statsVisibility = dataset.stats.map(() => true);

  const filteredRows = useMemo(() => {
    let rows = dataset.rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          Object.values(r.cells).some((v) =>
            String(v).toLowerCase().includes(q),
          ) || r.status.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "All")
      rows = rows.filter((r) => r.status === statusFilter);

    const nameKey = dataset.columns[0]?.key ?? "name";
    if (sortOption === "Name (A-Z)")
      rows = [...rows].sort((a, b) =>
        String(a.cells[nameKey]).localeCompare(String(b.cells[nameKey])),
      );
    if (sortOption === "Name (Z-A)")
      rows = [...rows].sort((a, b) =>
        String(b.cells[nameKey]).localeCompare(String(a.cells[nameKey])),
      );

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av =
          sortKey === "status"
            ? a.status
            : sortKey === "rating"
              ? (a.rating ?? 0)
              : a.cells[sortKey];
        const bv =
          sortKey === "status"
            ? b.status
            : sortKey === "rating"
              ? (b.rating ?? 0)
              : b.cells[sortKey];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [dataset, search, statusFilter, sortOption, sortKey, sortDir]);

  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === pagedRows.length
        ? new Set()
        : new Set(pagedRows.map((r) => r.id)),
    );

  const onSortColumn = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setSortOption("Default");
  };

  const handleAdd = () => {
    const nameKey = dataset.columns[0].key;
    const newId = `${active}-${Date.now()}`;
    const newRow: Row = {
      id: newId,
      status: (statusOptions[1] ?? "Active") as Status,
      rating: dataset.columns.some((c) => c.key === "rating") ? 5.0 : undefined,
      cells: Object.fromEntries(
        dataset.columns
          .filter((c) => c.key !== "status" && c.key !== "rating")
          .map((c) => [
            c.key,
            c.key === nameKey ? "New entry" : c.numeric ? 0 : "—",
          ]),
      ),
    };
    setDatasets((prev) => ({
      ...prev,
      [active]: { ...prev[active], rows: [newRow, ...prev[active].rows] },
    }));
    setEditingId(newId);
    setEditValue("New entry");
    setPage(1);
    push(`${dataset.addLabel} — row added`);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const nameKey = dataset.columns[0].key;
    setDatasets((prev) => ({
      ...prev,
      [active]: {
        ...prev[active],
        rows: prev[active].rows.map((r) =>
          r.id === editingId
            ? {
                ...r,
                cells: { ...r.cells, [nameKey]: editValue || "Untitled" },
              }
            : r,
        ),
      },
    }));
    setEditingId(null);
  };

  const handleDelete = () => {
    setDatasets((prev) => ({
      ...prev,
      [active]: {
        ...prev[active],
        rows: prev[active].rows.filter((r) => !selected.has(r.id)),
      },
    }));
    push(`${selected.size} row(s) deleted`);
    setSelected(new Set());
  };

  const handleApplyCode = () =>
    push(`Promo code applied to ${selected.size} row(s)`);

  const handleEditInfo = () => {
    const firstId = Array.from(selected)[0];
    const row = dataset.rows.find((r) => r.id === firstId);
    if (row) {
      setEditingId(firstId);
      setEditValue(String(row.cells[dataset.columns[0].key]));
    }
    push("Editing first selected row");
  };

  const handleExport = () => {
    const cols = dataset.columns.filter((c) => visibleCols[c.label] !== false);
    const header = [...cols.map((c) => c.label)].join(",");
    const lines = filteredRows.map((r) =>
      cols
        .map((c) =>
          c.key === "status"
            ? r.status
            : c.key === "rating"
              ? (r.rating ?? "")
              : (r.cells[c.key] ?? ""),
        )
        .join(","),
    );
    const csv = [header, ...lines].join("\n");
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${active.toLowerCase()}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore outside the browser
    }
    push(`Exported ${filteredRows.length} rows as CSV`);
  };

  const toggleCol = (label: string) =>
    setVisibleCols((prev) => ({
      ...prev,
      [label]: prev[label] === false ? true : false,
    }));

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        style={font}
        className="relative flex h-screen w-full overflow-hidden bg-white dark:bg-black"
      >
        <Sidebar
          active={active}
          onActiveChange={handleActiveChange}
          search={search}
          setSearch={setSearch}
          onUpgrade={() => push("Fitur Multi-Cabang Enterprise Aktif")}
          onLearnMore={() => push("Membuka Panduan Multi-Cabang...")}
          onSelectWorkspace={handleSelectWorkspace}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            title={dataset.title}
            onShare={() => push("Tautan dashboard disalin")}
            onCustomizeWidget={() => setCustomizeOpen((o) => !o)}
            notifCount={notifCount}
            onBell={() => {
              setNotifCount(0);
              push("Notifikasi telah dibaca");
            }}
            darkMode={darkMode}
            setDarkMode={handleToggleDark}
          />
          <div className="relative flex-1 overflow-y-auto pb-4">
            <Toolbar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOption={sortOption}
              setSortOption={(v) => {
                setSortOption(v);
                setSortKey(null);
              }}
              statusOptions={statusOptions}
              showStats={showStats}
              setShowStats={setShowStats}
              onCustomize={() => setCustomizeOpen((o) => !o)}
              onExport={handleExport}
              onAdd={handleAdd}
              addLabel={dataset.addLabel}
            />

            <AnimatePresence>
              {customizeOpen && (
                <CustomizePopover
                  columns={dataset.columns.map((c) => c.label)}
                  visibleCols={visibleCols}
                  toggleCol={toggleCol}
                  onClose={() => setCustomizeOpen(false)}
                />
              )}
            </AnimatePresence>

            {showStats && (
              <StatsRow
                stats={dataset.stats}
                visible={statsVisibility}
                focused={focusedStat}
                setFocused={setFocusedStat}
              />
            )}

            <div className="px-6 pt-5">
              <ProductTable
                columns={dataset.columns}
                rows={pagedRows}
                visibleCols={visibleCols}
                selected={selected}
                toggleRow={toggleRow}
                toggleAll={toggleAll}
                sortKey={sortKey}
                sortDir={sortDir}
                onSortColumn={onSortColumn}
                editingId={editingId}
                editValue={editValue}
                setEditValue={setEditValue}
                onCommitEdit={commitEdit}
              />
              <BulkActionBar
                count={selected.size}
                onClear={() => setSelected(new Set())}
                onApplyCode={handleApplyCode}
                onEditInfo={handleEditInfo}
                onDelete={handleDelete}
              />
              <Pagination
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalRows={filteredRows.length}
              />
            </div>
          </div>
        </main>

        <ToastStack toasts={toasts} />
      </div>
    </div>
  );
}
