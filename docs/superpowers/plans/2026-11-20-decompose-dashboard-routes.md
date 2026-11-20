# Rencana Dekomposisi Dashboard: Pemecahan Route Mandiri (Decompose Dashboard Routes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah file monolitik `src/components/dashboard/dashboard-store.tsx` (3,400+ baris) menjadi arsitektur modular berbasis route TanStack Router dengan Shared Layout (`DashboardLayout`), sehingga setiap menu operasional memiliki URL mandiri, mendukung browser history (back/forward), deep-linking, dan isolasi kode yang bersih.

**Architecture:** 
1. Ekstraksi Shared Layout (`DashboardLayout`) yang menampung Sidebar BagUI dinamis per-cabang, TopBar dengan Ambient Brand Stripe, dan Role Switcher popover.
2. Migrasi setiap menu dari local tab state `active` menjadi TanStack Router route mandiri: `/dashboard`, `/inventory`, `/transfers`, `/tracking`, `/online-orders`, dan `/reports`.
3. Pemisahan komponen UI reusable (`StatsRow`, `BagTable`, `LiveTrackingModule`) ke file terisolasi sehingga masing-masing file berukuran ringkas (< 250 baris).

**Tech Stack:** React 19, TanStack Router (File-based Routing), TypeScript 5.9, Tailwind CSS v4, Lucide React, Motion (Framer Motion).

**Spec:** Kebutuhan arsitektur modular dari User Request: pemecahan `dashboard-store` per menu agar tidak tergantung pada local tab state.

---

## Global Constraints

- Semua route operasional internal toko menggunakan `DashboardLayout` agar konsistensi visual BagUI dan identitas toko tetap 100% terjaga.
- Path dan URL harus clean RESTful / semantic naming (`/dashboard`, `/inventory`, `/transfers`, `/tracking`, `/online-orders`, `/reports`).
- Tetap menjaga diferensiasi visual cabang (Aksen Biru-Indigo untuk Toko 1, Zamrud-Teal untuk Toko 2, Ungu untuk HQ).
- Seluruh tes yang sudah ada (`bun test`, 19 tests) dan typecheck (`bun x tsc --noEmit`) wajib tetap lulus 100%.

---

## Review Focus (Failure Modes & Edge Cases)

1. **Active Menu Desynchronization:** Mengakses `/inventory` langsung via URL harus otomatis menandai menu "Stok Inventaris" sebagai aktif di sidebar.
2. **Role Switching Across Routes:** Mengganti role kasir saat berada di `/tracking` harus tetap mempertahankan rute saat ini tanpa mental kembali ke `/`.
3. **Outlet Scoping Context:** Halaman yang dipecah (`/inventory`, `/transfers`, `/online-orders`) harus membaca active outlet dari `authStore` / `outletStore` secara reaktif.
4. **Mobile / Narrow Responsive Layout:** Sidebar collapse atau scrollable navigation tetap nyaman diakses pada layar kecil.
5. **No Regressions on Terminal Kasir `/pos` & Customer Shop `/shop`:** Alur checkout kasir dan pesanan online pelanggan tidak boleh terganggu.

---

## Peta File & Arsitektur Direktori

```
src/
├── components/
│   ├── layout/
│   │   ├── dashboard-layout.tsx     # [BARU] Shared layout (Sidebar + TopBar + Store Theme)
│   │   ├── sidebar.tsx              # [BARU] Sidebar navigasi BagUI & Store Context
│   │   └── top-bar.tsx              # [BARU] TopBar dengan ambient stripe & account menu
│   └── dashboard/
│       ├── live-tracking.tsx        # [SUDAH DIBUAT] Modul pelacakan logistik & kurir
│       ├── stats-cards.tsx          # [BARU] Komponen KPI metric cards
│       ├── bag-table.tsx            # [BARU] Tabel interaktif BagUI (sort, filter, action)
│       └── dashboard-store.tsx      # [DEPRECATED -> DIHAPUS / DIGANTI]
├── routes/
│   ├── dashboard.tsx                # Overview KPI & Aktivitas Cepat
│   ├── inventory.tsx                # Manajemen & Monitoring Stok Multi-Cabang
│   ├── transfers.tsx                # Protokol Mutasi Antar-Cabang (3-Stage)
│   ├── tracking.tsx                 # [BARU] Live Tracking Pengiriman & Surat Jalan
│   ├── online-orders.tsx            # Antrean Pesanan Belanja Online
│   ├── reports.tsx                  # [BARU] Laporan Keuangan & Laba/Rugi
│   └── pos.tsx                      # Terminal Kasir POS (Fullscreen)
```

---

## Rencana Tugas Pelaksanaan (Tasks Breakdown)

### Task 1: Ekstraksi Shared `DashboardLayout` dan Komponen Navigasi

**Files:**
- Create: `src/components/layout/dashboard-layout.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/top-bar.tsx`
- Test: Verifikasi render dan pergantian cabang

**Interfaces:**
- Produces: `<DashboardLayout title={string} actions={ReactNode}>{children}</DashboardLayout>`
- Consumes: `authStore`, `themeStore`, `outletStore`

- [ ] **Step 1: Buat `src/components/layout/sidebar.tsx`**
  - Mengambil logika navigasi BagUI dari `dashboard-store.tsx`.
  - Menggunakan TanStack Router `Link` atau `useLocation().pathname` untuk menentukan menu yang sedang aktif secara otomatis berdasarkan URL (bukan state lokal).
  - Menampilkan *Store Identity Card* spesifik untuk Toko 1, Toko 2, dan Super Admin HQ.
  - Menampilkan menu Akses Cepat Operasional ke `/pos`, `/shop`, `/transfers`, `/inventory`, `/online-orders`.

- [ ] **Step 2: Buat `src/components/layout/top-bar.tsx`**
  - Menampilkan Ambient Brand Stripe berwarna sesuai cabang aktif.
  - Title halaman dinamis, badge tipe toko, theme toggle (dark/light), avatar tim, dan tombol Customize.

- [ ] **Step 3: Buat `src/components/layout/dashboard-layout.tsx`**
  - Menggabungkan `Sidebar`, `TopBar`, dan children view container dalam flex container h-screen overflow-hidden.

- [ ] **Step 4: Verifikasi typecheck**
  - Jalankan `bun x tsc --noEmit`.

---

### Task 2: Ekstraksi Reusable Dashboard Table & Stats Components

**Files:**
- Create: `src/components/dashboard/stats-cards.tsx`
- Create: `src/components/dashboard/bag-table.tsx`

**Interfaces:**
- Produces: `<StatsCards stats={StatItem[]} />`
- Produces: `<BagTable columns={Col[]} rows={Row[]} onActionClick={fn} />`

- [ ] **Step 1: Buat `src/components/dashboard/stats-cards.tsx`**
  - Komponen modular 4-grid untuk menampilkan kartu metrik, tren persentase delta (+/-), dan info tooltip.

- [ ] **Step 2: Buat `src/components/dashboard/bag-table.tsx`**
  - Komponen tabel BagUI dengan search input, filter status popover, column customization, checkbox bulk selection, dan render tombol aksi interaktif untuk kolom "Tindakan".

- [ ] **Step 3: Verifikasi typecheck**
  - Jalankan `bun x tsc --noEmit`.

---

### Task 3: Refaktor Route `/dashboard` Menjadi Halaman Ringkas

**Files:**
- Modify: `src/routes/dashboard.tsx`
- Test: Buka `/dashboard` dan pastikan memuat dalam < 50ms tanpa kode monolitik

- [ ] **Step 1: Implementasi `src/routes/dashboard.tsx` dengan `DashboardLayout`**
  - Menampilkan ringkasan eksekutif cabang saat ini:
    - Toko 1: Omzet T1, Stok Gudang 797 unit, Permintaan Pasokan In-Transit, Kas Modal.
    - Toko 2: Omzet T2, Stok Display 126 unit, Pasokan Masuk 60 unit OTW, Kas Modal.
    - HQ: Konsolidasi Omzet, Total Stok Gabungan, Margin Laba.
  - Tabel aktivitas real-time dengan tombol tindakan langsung.
  - Total baris kode berkurang dari 3,400+ baris menjadi ~180 baris!

- [ ] **Step 2: Verifikasi tsc dan render**
  - Jalankan `bun x tsc --noEmit`.

---

### Task 4: Buat Route Baru `/tracking` (Dedicated Live Tracking Page)

**Files:**
- Create: `src/routes/tracking.tsx`
- Test: Navigasi langsung ke `/tracking` dari sidebar atau browser URL

- [ ] **Step 1: Daftarkan route `/tracking` di TanStack Router**
  - Mengimpor `LiveTrackingModule` dan membungkusnya dalam `<DashboardLayout title="Live Tracking Pengiriman & Armada Logistik">`.

- [ ] **Step 2: Hubungkan link di sidebar ke `/tracking`**
  - Klik menu "Live Tracking Pengiriman" di sidebar langsung memicu navigasi TanStack Router ke `/tracking`.

- [ ] **Step 3: Verifikasi build TanStack Router**
  - Jalankan `bun run build` agar `routeTree.gen.ts` memperbarui daftar route secara otomatis.

---

### Task 5: Refaktor Route `/inventory`, `/transfers`, `/online-orders`, dan `/reports`

**Files:**
- Modify: `src/routes/inventory.tsx` (bungkus dengan `DashboardLayout`)
- Modify: `src/routes/transfers.tsx` (bungkus dengan `DashboardLayout`)
- Modify: `src/routes/online-orders.tsx` (bungkus dengan `DashboardLayout`)
- Create: `src/routes/reports.tsx` (Laporan Keuangan & Penjualan Terpadu)

- [ ] **Step 1: Refaktor `src/routes/inventory.tsx`**
  - Integrasikan ke dalam `DashboardLayout` dengan title "Manajemen Stok & Inventaris".
  - Sinkronisasi filter cabang dengan outlet yang sedang aktif.

- [ ] **Step 2: Refaktor `src/routes/transfers.tsx`**
  - Integrasikan ke dalam `DashboardLayout` dengan title "Distribusi & Mutasi Stok Antar-Cabang".

- [ ] **Step 3: Refaktor `src/routes/online-orders.tsx`**
  - Integrasikan ke dalam `DashboardLayout` dengan title "Antrean Pesanan Belanja Online".

- [ ] **Step 4: Buat `src/routes/reports.tsx`**
  - Menampilkan ringkasan pendapatan, HPP, margin laba kotor, dan breakdown penjualan per produk dari API `/api/analytics/financial-report`.

---

### Task 6: Pembersihan File Monolitik & Verifikasi Penuh

**Files:**
- Cleanup: Hapus atau minimalkan `src/components/dashboard/dashboard-store.tsx`
- Verify: Jalankan seluruh test suite (`bun test`) dan compile typecheck (`bun x tsc --noEmit`)

- [ ] **Step 1: Hapus ketergantungan pada `dashboard-store.tsx`**
  - Pastikan tidak ada file yang lagi mengimpor `dashboard-store.tsx`.

- [ ] **Step 2: Jalankan full test suite**
  - `bun test` (19 tests must pass).
  - `bun x tsc --noEmit` (0 errors).
  - `bun run build` (Production Vite build succeeds).

- [ ] **Step 3: Commit & Push ke GitHub**
  - Commit terstruktur dan push ke `main` untuk trigger Vercel deployment.
