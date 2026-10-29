# PRD: Sistem POS Kasir & Multi-Outlet Inventory Management

> Dokumen Persyaratan Produk (Product Requirements Document) untuk platform POS kasir ritel dan kontrol stok multi-cabang terpadu.

---

## 1. Latar Belakang & Masalah Lapangan

Toko ritel memiliki 2 cabang fisik dengan peran operasional berbeda:
1. **Toko 1 (Pusat & Gudang Utama)**: Menjalankan penjualan kasir langsung sekaligus menjadi gudang pasokan induk.
2. **Toko 2 (Cabang Satelit)**: Menjalankan penjualan ritel langsung dengan ruang penyimpanan terbatas dan sepenuhnya bergantung pada pasokan dari Toko 1.

### Kendala Operasional:
* **Transfer Buta (Blind Stock Request)**: Staf Toko 2 sering meminta pengiriman barang tanpa visibilitas apakah stok di Gudang Toko 1 masih mencukupi atau sudah menipis.
* **Ketiadaan Jejak Mutasi**: Barang berpindah secara informal tanpa bukti status barang dikirim vs barang diterima, sehingga selisih fisik rawan terjadi.
* **Harga Manual & Kasir Bingung**: Tidak ada master data harga terpusat, menyebabkan kasir salah memasukkan harga jual dan transaksi tidak tercatat otomatis.

---

## 2. Tujuan & Sasaran Produk

1. **Visibilitas Stok Real-Time Antar-Cabang**: Staf Toko 2 dapat memantau saldo stok Toko 1 sebelum mengajukan permintaan pasokan.
2. **Transaksi Kasir Cepat & Ringan**: Kasir dapat mencari barang via nama/kode/barcode dan menyelesaikan transaksi dari laptop atau smartphone tanpa mewajibkan mesin printer struk fisik.
3. **Pencatatan Mutasi 3-Tahap**: Siklus mutasi wajib memiliki 3 status pasti (*Requested* $\rightarrow$ *Dispatched* $\rightarrow$ *Received*) untuk menjamin akuntabilitas stok antar-cabang.
4. **Sistem Terpadu Multi-Platform**: Menggunakan 1 basis kode dan 1 database untuk frontend dan backend, siap di-deploy secara serverless ke Vercel.

---

## 3. Persona Pengguna

* **Kasir Toko (Toko 1 / Toko 2)**:
  * Kebutuhan: Input pesanan cepat, pencarian harga instan, kalkulasi kembalian otomatis, struk digital.
* **Kepala Gudang Toko 1**:
  * Kebutuhan: Melihat daftar permintaan stok dari Toko 2, menyetujui pengiriman (*dispatch*), memotong stok gudang secara otomatis.
* **Pemilik Toko (Owner / Eksekutif)**:
  * Kebutuhan: Memantau omzet harian gabungan, perbandingan penjualan Toko 1 vs Toko 2, dan notifikasi peringatan stok kritis.

---

## 4. Rincian Fitur Utama

### 4.1. Master Produk & Katalog Harga
* Kolom: `id`, `sku`, `barcode`, `name`, `category`, `unit`, `cost_price` (HPP), `selling_price`.
* Fitur pencarian instan berdasarkan nama, barcode, atau kategori.
* Standardisasi harga jual seragam untuk seluruh outlet.

### 4.2. Kasir Penjualan POS
* Pemilihan outlet aktif: Toko 1 (Pusat) atau Toko 2 (Cabang).
* Keranjang belanja multi-item dengan update kuantitas dinamis.
* Metode pembayaran: Tunai (Cash) dengan hitung kembalian dan QRIS.
* Pengurangan stok atomik pada outlet yang sedang aktif saat checkout selesai.
* Struk digital ringkas di layar dengan ID Transaksi terformat.

### 4.3. Monitoring Stok Antar-Cabang
* Matriks komparasi tabel: Kode SKU, Nama Produk, Kategori, Harga Jual, Stok Toko 1, Stok Toko 2, Status Cabang.
* Peringatan stok kritis otomatis (*Alert Minta Tambah*) saat stok Toko 2 $\le$ batas minimum alert.

### 4.4. Mutasi Barang 3-Tahap (Stock Transfer)
1. **REQUESTED**: Toko 2 memilih barang dan kuantitas yang dibutuhkan beserta catatan kebutuhan.
2. **DISPATCHED**: Toko 1 menyetujui, menyiapkan barang, dan menekan tombol kirim (stok Toko 1 otomatis terpotong).
3. **RECEIVED**: Toko 2 menghitung fisik yang tiba dan menekan tombol konfirmasi terima (stok Toko 2 otomatis bertambah).

### 4.5. Dashboard Eksekutif & Analitik
* 4 Kartu KPI: Omzet Hari Ini, Stok Gudang Toko 1, Stok Cabang Toko 2, Jumlah Produk Menipis.
* Grafik Area 7 Hari Penjualan: Komparasi omzet Toko 1 vs Toko 2.
* Feed live transaksi kasir terbaru.

---

## 5. Non-Functional Requirements & Standar Arsitektur

* **Kecepatan & Responsivitas**: Desain *mobile-friendly* dan *desktop-friendly*, tanpa delay saat input di smartphone kasir.
* **Zero AI Slop**: Menghindari elemen dekoratif tanpa fungsi, bebas karakter em dash, dan warna status dengan kontras tinggi (WCAG AA).
* **Stack**: Hono Backend API + Vite Frontend + TanStack Router + Tailwind CSS v4 + Drizzle ORM PostgreSQL.
