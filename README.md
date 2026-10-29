# POS & Multi-Outlet Inventory Management

Sistem Point of Sale (POS) dan manajemen inventaris multi-cabang terintegrasi yang dirancang untuk mengatasi masalah distribusi stok buta (*blind request*), selisih mutasi fisik, serta ketidakpastian harga di meja kasir.

Dibangun dengan arsitektur modern **Hono (Serverless API)**, **Vite + React 19**, **TanStack Router**, **Tailwind CSS v4**, dan **Drizzle ORM**, sistem ini ringan dijalankan di laptop maupun smartphone kasir tanpa membebani infrastruktur server.

---

## Masalah Nyata di Lapangan

Dalam operasional ritel multi-outlet dengan 2 cabang:
1. **Peran Ganda Toko 1**: Toko 1 berfungsi sebagai toko ritel sekaligus gudang pasokan utama. Sering terjadi kasir Toko 1 menjual barang yang sebenarnya dialokasikan untuk dikirim ke Toko 2.
2. **Transfer Barang Buta**: Toko 2 meminta pasokan secara lisan atau pesan instan tanpa mengetahui apakah stok di gudang Toko 1 masih mencukupi atau sudah menipis.
3. **Ketiadaan Bukti Serah Terima**: Perpindahan barang fisik rawan terjadi selisih karena tidak ada catatan resmi barang dikirim vs barang diterima.
4. **Kasir Menghafal Harga**: Ketiadaan katalog harga digital membuat kasir ragu saat menyebut harga ke pembeli, memperlambat antrean, dan rawan salah input.

---

## Solusi & Alur Bisnis Terintegrasi (System Flow)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. MASTER KATALOG & HARGA                       │
│              (Satu sumber data harga jual & modal untuk semua)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│    TOKO 1 (PUSAT & GUDANG)   │          │   TOKO 2 (CABANG SATELIT)    │
├──────────────────────────────┤          ├──────────────────────────────┤
│ • POS Kasir Penjualan Ritel  │          │ • POS Kasir Penjualan Ritel  │
│ • Kontrol Alokasi Gudang     │          │ • Pantau Stok Gudang Toko 1  │
│ • Setujui & Dispatch Mutasi  │          │ • Ajukan Kebutuhan Restock   │
└──────────────┬───────────────┘          └──────────────▲───────────────┘
               │                                         │
               │        2. ALUR MUTASI BARANG 3-TAHAP    │
               └───────────────► [IN-TRANSIT] ───────────┘
                 (Kirim Barang)               (Terima Fisik)
```

### 1. Alur Transaksi Kasir POS (Atomic Stock Deduction)
1. Kasir memilih outlet aktif (**Toko 1** atau **Toko 2**) di bilah atas aplikasi.
2. Kasir mengetik nama barang, kode SKU, atau memindai barcode.
3. Barang masuk ke keranjang penjualan dengan harga jual terstandarisasi otomatis.
4. Kasir memasukkan nominal uang tunai yang diterima, sistem menghitung kembalian instan.
5. Saat transaksi diselesaikan:
   * Stok barang pada outlet yang sedang aktif langsung terpotong secara atomik di database.
   * Muncul ringkasan struk digital di layar (tanpa memerlukan mesin printer fisik).

### 2. Alur Monitoring Stok Antar-Cabang (Live Visibility)
* Staf Toko 2 membuka menu **Monitoring Stok**.
* Sistem menyajikan perbandingan berdampingan: `Stok Toko 1 (Gudang)` vs `Stok Toko 2 (Cabang)`.
* Jika stok di Toko 2 berada di bawah batas minimum (*threshold*), lencana otomatis berubah menjadi **Alert Minta Tambah** berwarna amber.

### 3. Alur Mutasi Barang 3-Tahap (Stock Transfer Custody)
Untuk mencegah selisih barang di jalan, mutasi diatur melalui 3 gerbang status:
1. **Tahap 1: REQUESTED (Diajukan Cabang)**
   * Staf Toko 2 memilih barang yang menipis dan menentukan jumlah yang diminta beserta catatan kebutuhan.
2. **Tahap 2: DISPATCHED (Dikirim Gudang Pusat)**
   * Staf Gudang Toko 1 memeriksa fisik barang, menyetujui, dan menekan tombol **"Kirim Barang dari Toko 1"**.
   * Stok Toko 1 otomatis dipotong pada tahap ini dan barang berstatus dalam perjalanan (*in-transit*).
3. **Tahap 3: RECEIVED (Diterima & Diverifikasi)**
   * Barang fisik tiba di Toko 2. Staf menghitung kesesuaian fisik dan menekan **"Konfirmasi Terima Barang di Toko 2"**.
   * Stok Toko 2 otomatis bertambah dan dokumen mutasi selesai.

### 4. Alur Analitik & Ringkasan Eksekutif
* Pemilik toko memantau 4 kartu metrik utama: total omzet hari ini, akumulasi stok gudang, stok cabang, dan jumlah item kritis.
* Grafik area 7 hari menampilkan visualisasi tren omzet Toko 1 vs Toko 2 untuk evaluasi performa penjualan mingguan.

---

## Fitur Utama

* **Master Data Terpusat**: Pencarian instan berdasarkan SKU, barcode, dan nama produk.
* **Kasir POS Mobile & Desktop**: Input cepat, hitung kembalian, dan struk digital ringkas.
* **Monitoring Stok Antar-Cabang**: Matriks komparasi stok real-time antar outlet.
* **Mutasi Barang 3-Tahap**: Tracking alur distribusi tertib tanpa kehilangan jejak fisik.
* **Dashboard Eksekutif**: Grafik analitik tren penjualan 7 hari via Recharts.
* **Desain Anti-Slop**: Antarmuka bersih, responsif, kontras tinggi (WCAG AA), dan bebas dari elemen dekoratif tanpa fungsi.

---

## Tech Stack

| Lapisan | Teknologi | Karakteristik |
| :--- | :--- | :--- |
| **Backend API** | [Hono](https://hono.dev/) | Ultrafast, ringan, berjalan sebagai Serverless Function di Vercel (`/api/*`) |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Single Page Application (SPA) instan tanpa reload |
| **Routing** | [TanStack Router](https://tanstack.com/router) | Type-safe routing dengan search params validation |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utilitas CSS modern dan responsif |
| **Icons** | [Lucide React](https://lucide.dev/) | Ikonografi SVG fungsional dan konsisten |
| **Charts** | [Recharts](https://recharts.org/) | Visualisasi area chart analitik penjualan |
| **Database & ORM** | [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL | Skema relasional terstruktur dengan type-safety |

---

## Struktur Direktori

```
pos-multicabang/
├── api/
│   └── index.ts                 # Handler Vercel Serverless Function untuk Hono
├── src/
│   ├── db/
│   │   └── schema.ts            # Skema relasional Drizzle ORM (Outlets, Products, Inventory, Orders, Transfers)
│   ├── routes/
│   │   ├── __root.tsx           # Shell layout aplikasi, header, dan outlet switcher
│   │   ├── dashboard.tsx        # Ringkasan eksekutif, KPI cards, dan grafik tren 7 hari
│   │   ├── index.tsx            # Antarmuka kasir POS & keranjang checkout
│   │   ├── inventory.tsx        # Matriks monitoring stok antar-cabang
│   │   └── transfers.tsx        # Manajemen alur mutasi barang 3-tahap
│   ├── server/
│   │   └── app.ts               # Router Hono API & data simulasi retail terpadu
│   ├── index.css                # Tailwind CSS v4 entrypoint
│   ├── main.tsx                 # Client bootstrap & TanStack Router provider
│   └── routeTree.gen.ts         # Generasi otomatis tree rute TanStack
├── DESIGN.md                    # Spesifikasi desain standar Google & aturan anti-slop
├── PRD.md                       # Product Requirements Document
├── SPEC.md                      # Spesifikasi teknis ringkas
├── vercel.json                  # Konfigurasi routing serverless Vercel
└── package.json
```

---

## Panduan Menjalankan Secara Lokal

### Prasyarat
* [Bun](https://bun.sh/) (disarankan) atau Node.js v20+

### Instalasi & Menjalankan Dev Server
```bash
# Clone repositori
git clone https://github.com/janfdev/pos-multicabang.git
cd pos-multicabang

# Install dependensi
bun install

# Jalankan development server
bun run dev
```

Buka peramban di `http://localhost:3000` untuk mulai menggunakan sistem.

### Build untuk Produksi
```bash
bun run build
```

---

## Deployment ke Vercel

Projek ini sudah dilengkapi `vercel.json` bawaan:
1. Hubungkan repositori `janfdev/pos-multicabang` di dashboard Vercel.
2. Vercel akan secara otomatis membangun frontend Vite ke folder `dist` dan membungkus `api/index.ts` sebagai serverless function Hono.
3. Seluruh endpoint backend dapat diakses melalui path `/api/*`.

---

## Lisensi
Didistribusikan di bawah lisensi MIT.
