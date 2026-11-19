# Linear & BagUI Minimalist UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merombak seluruh antarmuka aplikasi menjadi sistem desain minimalis modern bergaya Linear / BagUI / Vercel lengkap dengan font Geist, dukungan Dark Mode & Light Mode, Recharts modern bergradien halus, dan micro-interactions pada seluruh halaman.

**Architecture:** Memanfaatkan Tailwind CSS v4 class strategy untuk dark mode (`dark:bg-zinc-950`), custom CSS variables untuk warna netral Zinc, Geist web font, serta Zustand/LocalStorage theme store. Seluruh route TanStack Router di-upgrade tanpa mengubah logika bisnis API Hono atau kontrak database Drizzle.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, Recharts, TanStack Router, Geist Font, Bun Test.

**Spec:** [DESIGN.md](file:///d:/KERJAAN/pos-multicabang/DESIGN.md) & [PRD.md](file:///d:/KERJAAN/pos-multicabang/PRD.md)

## Global Constraints
- Menjaga 100% fungsionalitas dan logika bisnis yang sudah lolos uji (`bun test`).
- Mendukung Dark Mode dan Light Mode yang tersimpan di `localStorage` peramban.
- Menggunakan tipografi Geist dan Geist Mono yang tajam dan terbaca jelas.
- Angka rupiah, stok, dan SKU wajib menggunakan `font-mono tabular-nums`.
- Desain bebas dari elemen hampa fungsi (Zero AI slop) dan ramah perangkat layar sentuh mobile/tablet kasir.

## Review Focus
1. Theme Switcher: Pergantian tema Dark/Light harus responsif dan tidak menimbulkan flicker saat transisi halaman.
2. Kontras Warna: Seluruh teks harus memenuhi standar kontras WCAG AA baik dalam Light Mode maupun Dark Mode.
3. Keterbacaan Grafik: Recharts di `/dashboard` harus menggunakan tooltip tembus pandang bergaya kaca (*backdrop-blur*) yang jelas di kedua tema.
4. Kecepatan Kasir: Alur transaksi POS (`/`) tidak boleh terganggu oleh animasi yang lambat.
5. Katalog Publik: Rute `/shop` tetap bersih tanpa sidebar kasir dan tampil elegan bagi pembeli online.

---

### Task 1: Fondasi Font Geist, Global Theme CSS, dan Theme Store

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Create: `src/lib/themeStore.ts`

- [ ] **Step 1: Muat Font Geist & Geist Mono di `index.html`**
  Tambahkan CDN link font Geist Sans dan Geist Mono di `<head>` [index.html](file:///d:/KERJAAN/pos-multicabang/index.html).
- [ ] **Step 2: Buat theme state manager di `src/lib/themeStore.ts`**
  Sediakan listener dan helper `getTheme()`, `setTheme('light' | 'dark')`, `toggleTheme()`, yang mengontrol kelas `dark` pada elemen `<html>` dan menyimpannya di `localStorage`.
- [ ] **Step 3: Konfigurasi Tailwind CSS v4 dan variabel tema di `src/index.css`**
  Setel font family Geist sebagai font default sans-serif, styling scrollbar tipis modern, dan transisi warna halus.
- [ ] **Step 4: Verifikasi build font dan CSS**
  Jalankan `bun run build` untuk memastikan tidak ada error kompilasi CSS.

---

### Task 2: Redesign Shell Navigasi & Sidebar Desktop/Mobile

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Terapkan palet Zinc dark & light pada shell sidebar**
  Ubah background sidebar dari stone kaku menjadi Zinc modern (`bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800`).
- [ ] **Step 2: Desain ulang avatar outlet aktif dan switch button**
  Tampilkan lencana cabang dengan indikator lampu status hijau neon dan alamat toko yang rapi.
- [ ] **Step 3: Tambahkan tombol toggle Dark/Light Mode**
  Sediakan tombol ikon Sun/Moon di footer sidebar dan header mobile untuk mengganti tema instan.
- [ ] **Step 4: Update item navigasi dengan pill aktif elegan**
  Gunakan gaya tautan modern (`hover:bg-zinc-100 dark:hover:bg-zinc-900 [&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-900 [&.active]:text-zinc-950 dark:[&.active]:text-white`).

---

### Task 3: Redesign Modern Dashboard & Sleek Area Chart

**Files:**
- Modify: `src/routes/dashboard.tsx`

- [ ] **Step 1: Desain ulang 4 kartu metrik KPI utama**
  Tampilkan angka tebal tabular (`text-2xl font-black font-mono`), border tipis Zinc, dan sub-metrik perbandingan POS vs Online.
- [ ] **Step 2: Poles grafik Recharts 7 hari dengan gradien modern**
  Konfigurasi kurva *monotone*, warna kurva emerald (`#10b981`) dan amber (`#f59e0b`), serta tooltip kaca berlatar gelap/terang adaptif.
- [ ] **Step 3: Desain ulang live order feed transaksi kasir & pesanan online**
  Tabel/daftar transaksi bergaya minimalis dengan pill status lembut dan angka rupiah berwarna kontras.

---

### Task 4: Redesign Terminal Kasir POS Offline

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Desain ulang header kasir & bilah pencarian produk**
  Input pencarian instan SKU/barcode yang menonjol dengan shortcut pembersih input.
- [ ] **Step 2: Perbarui grid kartu produk kasir**
  Kartu produk bergaya iPad POS modern, indikator stok dinamis, harga terformat besar, dan tombol tambah cepat dengan *feedback* visual.
- [ ] **Step 3: Poles panel keranjang belanja & kalkulator kembalian**
  Panel kanan kasir dengan ringkasan subtotal jelas, input uang tunai cepat (pecahan 20k, 50k, 100k, pas), dan tombol checkout besar.
- [ ] **Step 4: Desain struk digital kasir modern**
  Modal struk digital berpenampilan bon belanja minimalis yang mudah disimpan atau dicetak.

---

### Task 5: Redesign Monitoring Stok & Mutasi Kurir Dua Arah

**Files:**
- Modify: `src/routes/inventory.tsx`
- Modify: `src/routes/transfers.tsx`

- [ ] **Step 1: Poles matriks monitoring stok di `src/routes/inventory.tsx`**
  Tabel inventaris dengan progress bar ketersediaan stok Toko 1 vs Toko 2 dan pill peringatan stok menipis.
- [ ] **Step 2: Poles alur mutasi barang di `src/routes/transfers.tsx`**
  Visual timeline 3-tahap kurir yang rapi, badge rute asal $\rightarrow$ tujuan yang kontras, dan modal form pengajuan mutasi baru.

---

### Task 6: Redesign Antrean Pesanan Online & Etalase Publik

**Files:**
- Modify: `src/routes/online-orders.tsx`
- Modify: `src/routes/shop.tsx`

- [ ] **Step 1: Poles antrean pesanan online kasir di `src/routes/online-orders.tsx`**
  Kartu pesanan dengan status workflow jelas (*Pending* $\rightarrow$ *Processing* $\rightarrow$ *Ready* $\rightarrow$ *Completed*), nomor WhatsApp pemesan yang bisa langsung dihubungi.
- [ ] **Step 2: Poles etalase publik pelanggan di `src/routes/shop.tsx`**
  Tampilan toko online modern berstandar internasional, pemilih cabang ramah mobile, drawer keranjang belanja halus, dan tombol konfirmasi WhatsApp.

---

### Task 7: Verifikasi Build, Test Suite, dan Deploy ke Vercel

**Files:**
- Test: `tests/posAndTransfer.test.ts`
- Test: `tests/onlineOrders.test.ts`

- [ ] **Step 1: Jalankan seluruh test suite otomatis**
  Jalankan `bun test` untuk memastikan seluruh logika bisnis tetap 100% lolos (13/13 pass).
- [ ] **Step 2: Jalankan build produksi**
  Jalankan `bun run build` dan verifikasi bundle asset terkompilasi tanpa error TypeScript.
- [ ] **Step 3: Commit dan push ke GitHub origin main**
  Kirim perubahan ke GitHub agar otomatis di-deploy ke Vercel production.
