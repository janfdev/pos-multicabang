# Penyelarasan Alur Sistem dengan Proposal Revisi Capstone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelaraskan seluruh alur sistem operasional multi-cabang (katalog online, POS, mutasi, stock opname, dan RBAC) agar 100% mematuhi aturan bisnis dan spesifikasi dokumen `Proposal_POS_MultiCabang_Revisi.md`.

**Architecture:** Memanfaatkan arsitektur monolith web fullstack TypeScript modern (Hono backend API + TanStack Router client + Tailwind v4 + Drizzle ORM). Menambahkan validasi aturan ongkir & batas radius 5 km pada kanal pemesanan online, integrasi pembayaran digital Midtrans Sandbox dengan webhook idempotent pada terminal POS, dialog penyesuaian fisik (stock opname) pada inventaris, serta 5 peran pengguna sesuai matriks hak akses proposal.

**Tech Stack:** React 19, TanStack Router, Hono, Drizzle ORM, Tailwind CSS v4, Lucide Icons, Bun Test.

**Spec:** [Proposal_POS_MultiCabang_Revisi.md](file:///d:/KERJAAN/pos-multicabang/Proposal_POS_MultiCabang_Revisi.md)

---

## Global Constraints
- **Zero AI Slop**: Desain antarmuka bersih, kontras tinggi (WCAG AA), navigasi intuitif mengikuti design system BagUI.
- **Strictly No Emojis**: 100% menggunakan Lucide Icons, bebas dari emoji dan karakter unicode tak baku.
- **File Length Constraint**: Tidak ada file yang melebihi 1.100 baris kode.
- **Atomic Stock Invariant**: Pengurangan dan penambahan stok harus atomik, tidak boleh menghasilkan stok negatif (*negative stock protection*).
- **Test-Driven Verification**: Seluruh logika bisnis baru wajib diverifikasi dengan `bun test` dengan hasil 100% lulus (green).

---

## Review Focus
1. **Aturan Ongkir & Minimum Belanja Delivery (F-16 & F-17)**:
   - Jika `fulfillmentType === 'DELIVERY'`, subtotal belanja wajib minimal Rp30.000. Jika $<$ Rp30.000, sistem menolak checkout dengan pesan jelas.
   - Jika subtotal $<$ Rp50.000, ongkir Rp5.000 ditambahkan ke tagihan.
   - Jika subtotal $\ge$ Rp50.000, ongkir Rp0 (Gratis) dan label "Gratis Ongkir" ditampilkan.
   - Jika `fulfillmentType === 'PICKUP'`, ongkir Rp0 tanpa syarat minimum Rp30.000.
2. **Radius Pengiriman Maksimal 5 km (F-16 & Aturan Bisnis 3)**:
   - Pelanggan di luar radius 5 km dialihkan ke metode pengambilan di toko (*Pick-Up*).
3. **Pemisahan Alur Pesanan Online vs POS (Aturan Bisnis 8)**:
   - Pesanan online Fase 1 berstatus awal `PENDING` ("Menunggu Konfirmasi Toko"), tidak memotong stok di muka sampai disetujui toko.
4. **Pembayaran Digital POS & Idempotensi Webhook (F-05 & Aturan Bisnis 6)**:
   - POS terminal kasir melayani Tunai dan Digital (Midtrans Sandbox / QRIS).
   - Webhook menerima notifikasi resmi; status duplikat tidak boleh memotong stok lebih dari satu kali (*idempotency*).
5. **Stock Opname (F-09 & Aturan Bisnis 11)**:
   - Setiap penyesuaian fisik wajib menyertakan alasan, jumlah selisih, identitas petugas, dan timestamp.

---

### Task 1: Logika Bisnis Layanan Delivery & Kalkulasi Ongkir di Toko Online

**Files:**
- Modify: `src/server/app.ts`
- Modify: `src/routes/shop.tsx`
- Test: `tests/onlineOrders.test.ts`

**Interfaces:**
- Consumes: `onlineOrders` table schema, `/api/online-orders` endpoint.
- Produces: `subtotal`, `deliveryFee`, `totalAmount` terpisah pada pesanan online, validasi minimum order Rp30.000 untuk delivery.

- [ ] **Step 1: Tulis unit test untuk aturan delivery & ongkir di `tests/onlineOrders.test.ts`**
  - Uji penolakan pesanan delivery dengan subtotal Rp25.000 ($<$ Rp30.000).
  - Uji pesanan delivery subtotal Rp35.000 $\rightarrow$ ongkir Rp5.000 $\rightarrow$ total Rp40.000.
  - Uji pesanan delivery subtotal Rp76.000 $\rightarrow$ ongkir Rp0 (Gratis) $\rightarrow$ total Rp76.000.
  - Uji pesanan pickup subtotal Rp15.000 $\rightarrow$ ongkir Rp0 (Lolos).
- [ ] **Step 2: Jalankan test dan pastikan gagal (Red)**
  - Run: `bun test tests/onlineOrders.test.ts`
  - Expected: FAIL pada aturan baru.
- [ ] **Step 3: Implementasi logika validasi & ongkir di backend `src/server/app.ts`**
  - Di `POST /online-orders`: hitung subtotal barang, jika `DELIVERY` validasi subtotal $\ge 30000$, tentukan `deliveryFee` (Rp5.000 jika subtotal $< 50000$, else 0), dan `totalAmount = subtotal + deliveryFee`.
- [ ] **Step 4: Perbarui UI Checkout & Drawer Keranjang di `src/routes/shop.tsx`**
  - Tampilkan rincian: Subtotal, Ongkos Kirim (dengan badge Gratis Ongkir bila $\ge$ Rp50.000), dan Total Pembayaran.
  - Tambahkan validasi & pesan interaktif jika subtotal delivery belum mencapai Rp30.000 (contoh: "Tambah belanjaan Rp5.000 lagi untuk pengiriman delivery").
  - Tambahkan banner / toggle radius 5 km pada opsi delivery.
  - Perbarui draf WhatsApp agar memuat rincian ongkos kirim secara transparan.
- [ ] **Step 5: Jalankan test dan pastikan lulus (Green)**
  - Run: `bun test tests/onlineOrders.test.ts`
  - Expected: PASS seluruh skenario.
- [ ] **Step 6: Commit Task 1**
  - `git add tests/onlineOrders.test.ts src/server/app.ts src/routes/shop.tsx`
  - `git commit -m "feat(shop): add delivery minimum Rp30k, shipping fee rules, and 5km radius indicator"`

---

### Task 2: Integrasi Pembayaran Digital (Midtrans Sandbox / QRIS) di Terminal POS

**Files:**
- Modify: `src/server/app.ts`
- Modify: `src/routes/pos.tsx`
- Test: `tests/posAndTransfer.test.ts`

**Interfaces:**
- Consumes: `/api/pos/checkout`, `orders` table.
- Produces: `/api/pos/midtrans/charge`, `/api/pos/midtrans/webhook`, modal QRIS scanner di POS.

- [ ] **Step 1: Tulis unit test untuk Midtrans Sandbox charge & webhook idempotency di `tests/posAndTransfer.test.ts`**
  - Uji pembuatan pesanan berstatus digital dengan gateway reference.
  - Uji webhook notifikasi status settlement: stok terpotong tepat 1 kali.
  - Uji webhook duplikat kedua kali: respon sukses tetapi stok TIDAK terpotong lagi (*idempotency*).
  - Uji webhook status expire/cancel: transaksi digagalkan dan stok tidak berkurang.
- [ ] **Step 2: Jalankan test dan pastikan gagal (Red)**
  - Run: `bun test tests/posAndTransfer.test.ts`
  - Expected: FAIL pada endpoint charge & webhook yang belum ada.
- [ ] **Step 3: Implementasi endpoint Midtrans Sandbox di `src/server/app.ts`**
  - Tambahkan route `POST /api/pos/midtrans/charge` (menghasilkan mock QRIS payment link & transaction ID).
  - Tambahkan route `POST /api/pos/midtrans/webhook` dengan pengecekan status, pemotongan stok tepat satu kali, dan verifikasi idempotensi.
- [ ] **Step 4: Tambahkan opsi metode pembayaran di Terminal POS `src/routes/pos.tsx`**
  - Tombol pemilih metode: "Uang Tunai (Cash)" vs "QRIS / Digital Sandbox (Midtrans)".
  - Jika memilih QRIS/Digital: tampilkan modal QRIS interaktif dengan timer kedaluwarsa dan tombol "Simulasi Pembayaran Berhasil (Sandbox Callback)" untuk kemudahan demo pengujian dosen.
  - Cetak struk kasir menampilkan metode pembayaran QRIS/Midtrans dan kode referensi transaksi.
- [ ] **Step 5: Jalankan test dan pastikan lulus (Green)**
  - Run: `bun test tests/posAndTransfer.test.ts`
  - Expected: PASS.
- [ ] **Step 6: Commit Task 2**
  - `git add tests/posAndTransfer.test.ts src/server/app.ts src/routes/pos.tsx`
  - `git commit -m "feat(pos): add Midtrans sandbox digital payment and idempotent webhook"`

---

### Task 3: Modul Penyesuaian Fisik (Stock Opname) & Jejak Audit

**Files:**
- Create: `tests/stockOpname.test.ts`
- Modify: `src/server/app.ts`
- Modify: `src/routes/inventory.tsx`

**Interfaces:**
- Consumes: `inventory` per outlet.
- Produces: `POST /api/inventory/stock-opname`, dialog Stock Opname pada UI `/inventory`.

- [ ] **Step 1: Tulis unit test untuk Stock Opname di `tests/stockOpname.test.ts`**
  - Uji penyesuaian stok Toko 2 dari 10 menjadi 8 (selisih -2, alasan: "Kemasan bocor/rusak").
  - Verifikasi stok sistem terbarui dan jejak audit tersimpan.
  - Uji penolakan penyesuaian jika alasan tidak diisi.
- [ ] **Step 2: Jalankan test dan pastikan gagal (Red)**
  - Run: `bun test tests/stockOpname.test.ts`
  - Expected: FAIL.
- [ ] **Step 3: Implementasi endpoint Stock Opname di `src/server/app.ts`**
  - Buat handler `POST /api/inventory/stock-opname`: menerima `productId`, `outletId`, `actualStock`, `reason`, `adjustedBy`.
  - Hitung perbedaan selisih (`diff`), sesuaikan stok di memori & DB, simpan catatan audit penyesuaian.
- [ ] **Step 4: Tambahkan dialog modal Stock Opname di `src/routes/inventory.tsx`**
  - Tombol "Stock Opname" di header tabel inventaris.
  - Form modal BagUI: pilih barang, masukkan jumlah fisik riil, hitung selisih otomatis, masukkan alasan penyesuaian.
  - Notifikasi sukses dan reload data stok otomatis.
- [ ] **Step 5: Jalankan test dan pastikan lulus (Green)**
  - Run: `bun test tests/stockOpname.test.ts`
  - Expected: PASS.
- [ ] **Step 6: Commit Task 3**
  - `git add tests/stockOpname.test.ts src/server/app.ts src/routes/inventory.tsx`
  - `git commit -m "feat(inventory): add stock opname physical audit adjustment dialog and API"`

---

### Task 4: Granularitas Akun & Hak Akses Sesuai 5 Aktor Proposal

**Files:**
- Modify: `src/lib/authStore.ts`
- Modify: `src/routes/login.tsx`

**Interfaces:**
- Consumes: `authStore`, `DEMO_ACCOUNTS`.
- Produces: 5 akun demo terpisah (Pemilik, Kasir T1, Kasir T2, Petugas Gudang T1, Petugas Cabang T2).

- [ ] **Step 1: Perbarui data akun demo di `src/lib/authStore.ts`**
  - Tambahkan 5 akun sesuai proposal:
    1. Pemilik / Super Admin (Akses semua gerai)
    2. Kasir Toko 1 (POS Toko 1)
    3. Kasir Toko 2 (POS Toko 2)
    4. Petugas Gudang Toko 1 (Kelola pengiriman & mutasi gudang pusat)
    5. Petugas Cabang Toko 2 (Pengajuan mutasi & stock opname cabang)
- [ ] **Step 2: Perbarui tampilan halaman Login di `src/routes/login.tsx`**
  - Tampilkan tombol quick-login untuk 5 akun demo terstruktur dengan badge peran masing-masing.
- [ ] **Step 3: Verifikasi build dan pengujian keseluruhan**
  - Run: `bun test`
  - Run: `npm run build`
  - Pastikan tidak ada type error dan seluruh build sukses.
- [ ] **Step 4: Commit Task 4**
  - `git add src/lib/authStore.ts src/routes/login.tsx`
  - `git commit -m "feat(auth): align 5 demo roles with proposal specifications"`
