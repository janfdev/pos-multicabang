# Bidirectional Stock Transfers & Online Customer Store (Model B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan kapabilitas mutasi stok dua arah (Toko 1 $\leftrightarrow$ Toko 2) dengan tracking timeline kurir, serta meluncurkan kanal penjualan online mandiri publik (Model B: `/shop`) terintegrasi dengan antrean pemrosesan order kasir (`/online-orders`).

**Architecture:** Memanfaatkan arsitektur Fullstack TypeScript yang ada (Hono API + TanStack Router + Tailwind v4 + Drizzle ORM). Backend diperluas dengan tabel dan rute dinamis untuk transfer dua arah serta siklus hidup pesanan online (*Pending* $\rightarrow$ *Processing* $\rightarrow$ *Ready* $\rightarrow$ *Completed*). Frontend menambahkan route publik `/shop` untuk pelanggan dan route admin `/online-orders` untuk staf kasir.

**Tech Stack:** React 19, TanStack Router, Hono, Drizzle ORM, PostgreSQL, Tailwind CSS v4, Lucide Icons, Recharts, Bun Test.

**Spec:** [PRD.md](file:///d:/KERJAAN/pos-multicabang/PRD.md) & [SPEC.md](file:///d:/KERJAAN/pos-multicabang/SPEC.md)

## Global Constraints
- Menggunakan bahasa TypeScript murni dengan type safety.
- Zero AI slop: Desain bersih, kontras tinggi (WCAG AA), tanpa elemen dekoratif hampa fungsi.
- Menjamin pengurangan stok atomik (tidak boleh ada *negative stock* baik dari transaksi kasir maupun pesanan online).
- Tidak memecah repositori; seluruh fitur berjalan dalam arsitektur terpadu monolith modern yang ada.
- Seluruh pengujian otomatis dijalankan dengan `bun test` dan harus mencapai 100% pass.

## Review Focus
1. Transfer balik dari Cabang ke Pusat (Toko 2 $\rightarrow$ Toko 1): Stok Toko 2 harus dipotong saat DISPATCH, dan stok Toko 1 harus bertambah saat RECEIVE.
2. Pencegahan Overselling Online: Jika stok barang di cabang terpilih hanya tersisa 2, dan ada pesanan online sebanyak 3, sistem harus menolak checkout dengan pesan kesalahan yang jelas.
3. Alokasi Stok Pesanan Online: Stok cabang hanya dipotong saat status pesanan berubah menjadi `PROCESSING` (bukan saat baru `PENDING`), dan jika pesanan `CANCELLED`, stok harus di-rollback secara utuh.
4. Isolasi Tampilan Publik: Rute `/shop` tidak boleh menampilkan navigasi sidebar kasir internal atau tombol ganti outlet admin.
5. Tracking Timeline Mutasi: Setiap mutasi harus merekam timestamp pengajuan, waktu kirim, nama staf/kurir pengantar, dan waktu konfirmasi penerimaan.

---

### Task 1: Skema Database & Server API Mutasi Barang Dua Arah

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `src/server/app.ts`
- Test: `tests/posAndTransfer.test.ts`

- [x] **Step 1: Update schema Drizzle ORM untuk transfer dua arah**
  Tambahkan enum `transfer_type` (`RESTOCK`, `RETURN`, `REBALANCE`) dan kolom `courier_name`, `dispatched_by`, `received_by` pada tabel `stock_transfers` di `src/db/schema.ts`.
- [x] **Step 2: Tulis failing test di `tests/posAndTransfer.test.ts`**
  Buat test case untuk:
  - Pengajuan transfer Toko 2 ke Toko 1 (Retur barang rusak).
  - Dispatch oleh Toko 2 (stok Toko 2 terpotong).
  - Receive oleh Toko 1 (stok Toko 1 bertambah).
- [x] **Step 3: Jalankan test dan pastikan gagal (Red)**
  Run `bun test` dan konfirmasi kegagalan pada test case baru.
- [x] **Step 4: Implementasi logika rute dinamis di `src/server/app.ts`**
  Perbarui handler `POST /transfers/request`, `POST /transfers/:id/dispatch`, dan `POST /transfers/:id/receive` agar mengevaluasi `fromOutletId` dan `toOutletId` secara dinamis, mencatat kurir, dan memotong/menambah stok pada cabang yang sesuai.
- [x] **Step 5: Jalankan test dan pastikan lulus (Green)**
  Run `bun test` dan pastikan seluruh test transfer dua arah lolos.

---

### Task 2: UI Antarmuka Mutasi Barang Dua Arah & Tracking Timeline

**Files:**
- Modify: `src/routes/transfers.tsx`

- [x] **Step 1: Perbarui antarmuka form pengajuan transfer**
  Tambahkan dropdown pemilihan rute mutasi:
  - Toko 1 (Pusat) $\rightarrow$ Toko 2 (Cabang): Kategori Restock
  - Toko 2 (Cabang) $\rightarrow$ Toko 1 (Pusat): Kategori Retur Barang / Rebalancing
- [x] **Step 2: Tambahkan input data kurir / ekspedisi saat tombol "Kirim Barang" ditekan**
  Tambahkan dialog atau form input nama kurir/pengantar sebelum status berubah menjadi `DISPATCHED`.
- [x] **Step 3: Tambahkan komponen visual Tracking Timeline**
  Buat timeline step horizontal/vertikal yang menampilkan:
  - Step 1: Diajukan (Waktu & Peminta)
  - Step 2: Dalam Perjalanan (Waktu Dispatch & Nama Kurir)
  - Step 3: Diterima (Waktu Penerimaan & Verifikasi Fisik)
- [x] **Step 4: Verifikasi visual dan interaksi**
  Uji coba pengajuan mutasi dari Toko 2 ke Toko 1 dan pastikan alur tombol dispatch & receive berfungsi mulus.

---

### Task 3: Backend API & Skema Database untuk Penjualan Online Mandiri

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `src/server/app.ts`
- Create: `tests/onlineOrders.test.ts`

- [x] **Step 1: Definisikan skema Drizzle ORM untuk order online**
  Tambahkan tabel `online_orders` (`id`, `outlet_id`, `customer_name`, `customer_phone`, `fulfillment_type` ['PICKUP', 'DELIVERY'], `delivery_address`, `status` ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'], `total_amount`, `notes`, `created_at`) dan `online_order_items`.
- [x] **Step 2: Tulis test suite di `tests/onlineOrders.test.ts`**
  Uji skenario:
  - Customer checkout online berhasil membuat order dengan status `PENDING`.
  - Penolakan checkout jika kuantitas melebihi stok cabang.
  - Perubahan status ke `PROCESSING` memotong stok cabang secara atomik.
  - Pembatalan (`CANCELLED`) mengembalikan stok cabang (*rollback*).
- [x] **Step 3: Jalankan test dan pastikan gagal (Red)**
  Run `bun test tests/onlineOrders.test.ts`.
- [x] **Step 4: Implementasikan endpoint API di `src/server/app.ts`**
  Tambahkan rute:
  - `POST /api/online-orders` (checkout pelanggan)
  - `GET /api/online-orders` (daftar antrean order online)
  - `PATCH /api/online-orders/:id/status` (update status pesanan & mutasi stok atomik)
- [x] **Step 5: Jalankan test dan pastikan lulus (Green)**
  Run `bun test` dan verifikasi semua 100% lulus.

---

### Task 4: Etalase Belanja Publik Pelanggan (`/shop`)

**Files:**
- Create: `src/routes/shop.tsx`

- [x] **Step 1: Buat rute publik `/shop` di TanStack Router**
  Bangun halaman khusus belanja pelanggan tanpa sidebar navigasi kasir. Sediakan header minimalis dengan logo toko dan pilihan cabang terdekat.
- [x] **Step 2: Implementasikan pemilihan cabang & katalog produk interaktif**
  Tampilkan produk dengan stok riil cabang yang dipilih pelanggan, pencarian cepat, dan filter kategori.
- [x] **Step 3: Implementasikan keranjang belanja online**
  Drawer atau panel keranjang belanja yang menghitung subtotal dan kuantitas barang secara reaktif.
- [x] **Step 4: Bangun modal formulir checkout mandiri**
  Input: Nama lengkap, No. WhatsApp, Metode (*Ambil Sendiri* atau *Kirim Kurir*), Alamat pengiriman, dan Catatan.
- [x] **Step 5: Layar konfirmasi pesanan & tombol WhatsApp**
  Tampilkan nomor invoice pesanan online, rincian barang, total bayar, dan tombol *"Konfirmasi via WhatsApp"* ke nomor admin toko.

---

### Task 5: Antrean Pesanan Online Kasir (`/online-orders`) & Navigasi

**Files:**
- Create: `src/routes/online-orders.tsx`
- Modify: `src/routes/__root.tsx`

- [x] **Step 1: Tambahkan rute `/online-orders` di sidebar dan topbar kasir**
  Perbarui [src/routes/__root.tsx](file:///d:/KERJAAN/pos-multicabang/src/routes/__root.tsx) dengan menambahkan menu *"Pesanan Online"* dan badge indikator order baru.
- [x] **Step 2: Buat tabel antrean pesanan online di `src/routes/online-orders.tsx`**
  Tampilkan daftar pesanan yang masuk ke outlet aktif, dikelompokkan berdasarkan tab status: `Semua`, `Menunggu Diproses`, `Siap Diambil/Dikirim`, `Selesai`.
- [x] **Step 3: Tombol aksi alur pemrosesan pesanan**
  - Tombol *"Proses Pesanan & Potong Stok"* (transisi ke `PROCESSING`).
  - Tombol *"Siap Diambil / Diserahkan Kurir"* (transisi ke `READY`).
  - Tombol *"Selesaikan Pesanan"* (transisi ke `COMPLETED`).
  - Tombol *"Batalkan Pesanan"* (transisi ke `CANCELLED` dengan konfirmasi).

---

### Task 6: Integrasi Dashboard Analitik & Verifikasi Menyeluruh

**Files:**
- Modify: `src/routes/dashboard.tsx`
- Modify: `src/server/app.ts`

- [x] **Step 1: Gabungkan metrik omzet penjualan POS dan Penjualan Online**
  Perbarui endpoint `/api/analytics/dashboard` agar menghitung omzet dari transaksi POS offline + pesanan online yang selesai.
- [x] **Step 2: Update kartu KPI dan grafik 7 hari di `src/routes/dashboard.tsx`**
  Tambahkan indikator porsi penjualan (Offline POS vs Online Store) pada grafik omzet.
- [x] **Step 3: Jalankan seluruh test suite otomatis**
  Run `bun test` untuk memastikan semua integrasi backend tetap hijau tanpa regresi.
- [x] **Step 4: Audit responsivitas UI dan build produksi**
  Jalankan `bun run build` untuk memverifikasi tidak ada error tipe TypeScript atau kompilasi Vite.
