# SPEC.md: Sistem POS, Multi-Outlet Inventory & Penjualan Online (Hono + TanStack Router)

## 1. Ringkasan Sistem
Sistem terintegrasi Point of Sale (POS), Manajemen Inventaris Multi-Outlet, dan Penjualan Online Mandiri (Model B):
- **Toko 1 (Pusat & Gudang Utama)**: Melayani transaksi ritel offline kasir, pusat pemenuhan (*fulfillment*) stok utama, dan menerima retur dari cabang.
- **Toko 2 (Cabang Satelit)**: Melayani transaksi ritel offline kasir, memonitor stok gudang Toko 1, mengajukan restock, dan dapat mengirim retur barang rusak/kelebihan stok ke Toko 1.
- **Etalase Publik (`/shop`)**: Web store mandiri bagi pelanggan publik untuk memesan produk dari outlet terdekat secara online.
- **Antrean Order Online (`/online-orders`)**: Dashboard bagi kasir untuk memverifikasi pembayaran, memproses packing, dan menyerahkan pesanan online.

## 2. Arsitektur & Tech Stack
- **Framework & Runtime**: Hono (Backend API) + Vite (Frontend SPA) + Bun/Node.
- **Frontend Routing**: TanStack Router (`@tanstack/react-router`) untuk routing type-safe di desktop dan mobile.
- **Styling**: Tailwind CSS v4 + Lucide Icons (WCAG AA compliant, anti-slop).
- **ORM & Database**: Drizzle ORM + PostgreSQL.
- **Target Deployment**: Vercel (Frontend SPA + API Serverless Hono di `/api/*`).

## 3. Fitur Utama
1. **Master Katalog Produk & Harga Terpusat**:
   - SKU, Barcode, Nama Produk, Kategori, Harga Modal (HPP), Harga Jual.
   - Sumber kebenaran tunggal (*Single Source of Truth*) untuk POS dan toko online.
2. **Kasir POS Offline (Mobile & Laptop Friendly)**:
   - Pilih outlet aktif (Toko 1 atau Toko 2).
   - Keranjang belanja, hitung kembalian cepat, struk digital, potongan stok atomik.
3. **Monitoring Stok Antar-Cabang (Live Matrix)**:
   - Matriks real-time: Nama Barang | Stok Toko 1 (Gudang) | Stok Toko 2 (Cabang) | Status Ambang Batas.
4. **Mutasi Barang Dua Arah (Bidirectional Stock Custody)**:
   - Rute dinamis: `Toko 1 -> Toko 2` (Restock) & `Toko 2 -> Toko 1` (Return/Rebalance).
   - 3-Tahap Pengamanan: *REQUESTED* $\rightarrow$ *DISPATCHED (In-Transit)* $\rightarrow$ *RECEIVED*.
   - Audit trail kurir pengantar dan waktu tempuh.
5. **Katalog Online Mandiri (`/shop`)**:
   - Pemilihan cabang terdekat, katalog interaktif, keranjang belanja online, formulir pemesanan (*Delivery / Pickup*).
6. **Manajemen Order Online Kasir (`/online-orders`)**:
   - Siklus status: `PENDING` $\rightarrow$ `PROCESSING` (potong stok) $\rightarrow$ `READY` $\rightarrow$ `COMPLETED` / `CANCELLED`.
7. **Dashboard Analitik Terpadu**:
   - Metrik KPI gabungan (omzet harian offline + online), perbandingan performa 2 cabang, dan tren 7 hari.
