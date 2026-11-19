# PRD: Sistem POS Kasir, Multi-Outlet Inventory & Penjualan Online

> Dokumen Persyaratan Produk (Product Requirements Document) untuk platform POS kasir ritel, kontrol stok multi-cabang dua arah terpadu, dan etalase penjualan online mandiri (Model B).

---

## 1. Latar Belakang & Masalah Lapangan

Toko ritel memiliki 2 cabang fisik dengan peran operasional berbeda:
1. **Toko 1 (Pusat & Gudang Utama)**: Menjalankan penjualan kasir langsung sekaligus menjadi gudang pasokan induk.
2. **Toko 2 (Cabang Satelit)**: Menjalankan penjualan ritel langsung dengan ruang penyimpanan terbatas dan bergantung pada pasokan dari Toko 1.

### Kendala Operasional:
* **Transfer Buta (Blind Stock Request)**: Staf Toko 2 sering meminta pengiriman barang tanpa visibilitas apakah stok di Gudang Toko 1 masih mencukupi atau sudah menipis.
* **Ketiadaan Jejak Mutasi & Retur Dua Arah**: Barang berpindah secara informal tanpa bukti status barang dikirim vs barang diterima. Toko 2 juga belum memiliki mekanisme formal untuk mengembalikan barang rusak (*damaged*), mendekati kadaluarsa, atau kelebihan stok (*slow moving*) kembali ke Toko 1.
* **Ketiadaan Kanal Penjualan Online**: Penjualan hanya bertumpu pada kasir fisik tatap muka di toko. Pelanggan tidak dapat melihat ketersediaan stok cabang dari rumah atau memesan secara mandiri untuk diambil di toko (*store pickup*) maupun dikirim kurir.
* **Harga Manual & Kasir Bingung**: Tidak ada master data harga terpusat, menyebabkan kasir salah memasukkan harga jual dan transaksi tidak tercatat otomatis.

---

## 2. Tujuan & Sasaran Produk

1. **Visibilitas Stok Real-Time Antar-Cabang**: Staf Toko 2 dapat memantau saldo stok Toko 1 sebelum mengajukan permintaan pasokan, dan sebaliknya Toko 1 dapat memantau pergerakan stok Toko 2.
2. **Mutasi Barang Dua Arah dengan Custody Tracking**: Siklus transfer barang fisik dapat dilakukan dari Toko 1 $\rightarrow$ Toko 2 (Restock) maupun Toko 2 $\rightarrow$ Toko 1 (Retur/Rebalance) dengan 3 status pasti (*Requested* $\rightarrow$ *Dispatched* $\rightarrow$ *Received*) serta riwayat kurir/pengantar.
3. **Kanal Penjualan Online Mandiri (Model B)**: Etalase katalog web publik (`/shop`) untuk pelanggan memilih cabang terdekat, memesan produk secara mandiri (*self-service*), dan memilih opsi ambil di toko (*pickup*) atau kirim kurir (*delivery*).
4. **Antrean Pemrosesan Pesanan Online Terpadu**: Kasir/staf toko dapat memverifikasi pembayaran pesanan online, menyiapkan barang (*packing*), dan memotong stok cabang secara atomik.
5. **Transaksi Kasir POS Cepat & Ringan**: Kasir dapat mencari barang via nama/kode/barcode dan menyelesaikan transaksi dari laptop atau smartphone tanpa printer fisik.
6. **Sistem Terpadu Multi-Platform**: Menggunakan 1 basis kode Fullstack TypeScript (Hono + React 19 + TanStack Router), siap di-deploy secara serverless ke Vercel.

---

## 3. Persona Pengguna

* **Kasir Toko (Toko 1 / Toko 2)**:
  * Kebutuhan: Input kasir fisik cepat, kalkulasi kembalian, struk digital, serta menerima dan memproses antrean pesanan online yang masuk ke cabangnya.
* **Kepala Gudang / Staf Logistik (Toko 1 & Toko 2)**:
  * Kebutuhan: Mengajukan restock (Toko 2 $\rightarrow$ Toko 1), mengajukan retur barang cacat/berlebih (Toko 2 $\rightarrow$ Toko 1), menyetujui pengiriman (*dispatch*), dan mengonfirmasi penerimaan fisik (*receive*).
* **Pelanggan Online (Public Web Customer)**:
  * Kebutuhan: Melihat katalog produk dan ketersediaan stok di cabang pilihannya, memasukkan barang ke keranjang, memilih metode pengiriman/ambil toko, dan melakukan checkout mandiri tanpa harus login akun rumit.
* **Pemilik Toko (Owner / Eksekutif)**:
  * Kebutuhan: Memantau omzet harian gabungan (POS offline + pesanan online), perbandingan performa Toko 1 vs Toko 2, dan status mutasi barang yang sedang berjalan.

---

## 4. Rincian Fitur Utama

### 4.1. Master Produk & Katalog Harga
* Kolom: `id`, `sku`, `barcode`, `name`, `category`, `unit`, `cost_price` (HPP), `selling_price`.
* Standardisasi harga jual seragam untuk seluruh outlet baik di POS kasir maupun katalog online.
* Pencarian instan berbasis nama, SKU, dan kategori.

### 4.2. Kasir Penjualan POS Offline
* Pemilihan outlet aktif: Toko 1 (Pusat) atau Toko 2 (Cabang).
* Keranjang belanja multi-item dengan kalkulasi diskon atau jumlah dinamis.
* Metode pembayaran tunai dengan penghitungan kembalian instan serta pembayaran non-tunai (QRIS).
* Pengurangan stok atomik pada outlet yang sedang aktif saat checkout selesai.
* Struk digital ringkas di layar dengan ID Transaksi terformat.

### 4.3. Monitoring Stok Antar-Cabang
* Matriks komparasi berdampingan: SKU, Nama Produk, Kategori, Harga Jual, Stok Toko 1, Stok Toko 2, Status Ambang Batas.
* Indikator peringatan stok kritis (*Alert Minta Tambah*) saat stok cabang $\le$ batas minimum alert.

### 4.4. Mutasi Barang Dua Arah & Tracking Status (Bidirectional Stock Transfer)
* **Dukungan Rute 2 Arah:**
  - `Toko 1 -> Toko 2` (Kategori: *RESTOCK* / Pasokan Rutin Cabang)
  - `Toko 2 -> Toko 1` (Kategori: *RETURN* / Retur Rusak/Expired & *REBALANCE* / Relokasi Kelebihan Stok)
* **Alur Mutasi 3-Tahap (Chain of Custody):**
  1. **REQUESTED (Diajukan)**: Cabang peminta menentukan produk, kuantitas, kategori mutasi, dan catatan alasan. Stok fisik belum berpindah.
  2. **DISPATCHED (Dikirim)**: Cabang asal memverifikasi fisik, menginput nama kurir/pengantar, dan menekan *"Kirim Barang"*. Stok cabang asal langsung dipotong dan barang berstatus *IN-TRANSIT*.
  3. **RECEIVED (Diterima & Diverifikasi)**: Cabang penerima menghitung barang fisik yang tiba dan menekan *"Konfirmasi Terima Barang"*. Stok cabang penerima otomatis bertambah dan dokumen mutasi selesai.
* **Audit Trail / Timeline:** Menampilkan jejak waktu kapan diajukan, kapan diberangkatkan, siapa kurir pembawa barang, dan kapan diterima.

### 4.5. Etalase Penjualan Online Mandiri (Model B - Public Web Store `/shop`)
* **Halaman Belanja Publik:** Antarmuka responsif tanpa sidebar admin kasir, dirancang khusus untuk kenyamanan pembeli di peramban ponsel dan desktop.
* **Pemilihan Cabang Terdekat:** Pelanggan memilih outlet pemenuhan (**Toko 1** atau **Toko 2**) untuk melihat stok riil cabang tersebut.
* **Keranjang Belanja & Checkout Mandiri:**
  * Formulir checkout: Nama Pelanggan, Nomor WhatsApp/Telepon, Pilihan Layanan (*Ambil di Toko / Store Pickup* atau *Kirim Kurir / Delivery*), dan Alamat Lengkap.
  * Ringkasan order dengan nomor ID unik (contoh: `ONL-20261119-001`).
* **Instruksi Pembayaran & Konfirmasi:** Informasi transfer bank atau QRIS serta link cepat konfirmasi ke WhatsApp toko.

### 4.6. Manajemen Pesanan Online di Kasir (`/online-orders`)
* Antrean pesanan masuk khusus untuk kasir/staf outlet terkait.
* Siklus status order:
  - `PENDING`: Menunggu pembayaran / verifikasi pelanggan.
  - `PROCESSING`: Pembayaran dikonfirmasi, kasir sedang menyiapkan barang (*packing*). Stok cabang terpotong secara atomik pada tahap ini.
  - `READY`: Barang siap diambil di toko atau siap dijemput kurir.
  - `COMPLETED`: Barang telah diserahkan ke pelanggan/kurir.
  - `CANCELLED`: Pesanan dibatalkan (jika stok sudah terpotong, otomatis di-rollback).

### 4.7. Dashboard Eksekutif & Analitik Terpadu
* Metrik KPI Harian: Total Omzet (POS Offline + Online), Total Stok Toko 1, Total Stok Toko 2, dan Jumlah Mutasi Aktif *In-Transit*.
* Grafik Tren Penjualan 7 Hari dengan breakdown kontribusi Toko 1 vs Toko 2 serta rasio Offline vs Online.

---

## 5. Non-Functional Requirements & Standar Arsitektur

* **Kecepatan & Responsivitas**: Katalog publik `/shop` berbobot ringan, memuat gambar dan data secara cepat di jaringan seluler 4G/3G.
* **Atomic Concurrency**: Pemotongan stok kasir fisik dan pesanan online aman dari *race condition* (mencegah *overselling* saat sisa stok hanya 1).
* **Zero AI Slop**: Desain bersih, kontras tinggi (WCAG AA), navigasi ramah satu tangan pada smartphone, dan tidak ada elemen visual dekoratif yang mubazir.
* **Tech Stack**: Fullstack TypeScript (Hono Backend API + Vite + React 19 + TanStack Router + Tailwind CSS v4 + Drizzle ORM PostgreSQL).
