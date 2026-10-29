# SPEC.md: Sistem POS & Multi-Outlet Inventory (Hono + TanStack Router)

## 1. Ringkasan Sistem
Sistem Point of Sale (POS) & Manajemen Inventaris Multi-Outlet terpadu untuk 2 cabang:
- **Toko 1 (Pusat & Gudang Utama)**: Melayani transaksi ritel kasir dan bertindak sebagai pusat distribusi barang.
- **Toko 2 (Cabang Satelit)**: Melayani transaksi ritel kasir, memonitor stok gudang Toko 1, dan mengajukan permintaan transfer stok (*stock replenishment*).

## 2. Arsitektur & Tech Stack
- **Framework & Runtime**: Hono (Backend API) + Vite (Frontend SPA) + Bun/Node.
- **Frontend Routing**: TanStack Router (`@tanstack/react-router`) untuk routing type-safe dan performa instan di mobile/desktop.
- **Styling**: Tailwind CSS v4 + Lucide Icons.
- **ORM & Database**: Drizzle ORM + PostgreSQL (Coolify Container).
- **Target Deployment**: Vercel (Frontend SPA + API Serverless Hono di `/api/*`).

## 3. Fitur Utama
1. **Master Katalog Produk & Harga Terpusat**:
   - SKU, Barcode, Nama Produk, Kategori, Harga Modal (HPP), Harga Jual.
   - Pencarian instan tanpa perlu mengingat harga.
2. **Kasir POS (Mobile & Laptop Friendly)**:
   - Pilih outlet aktif (Toko 1 atau Toko 2).
   - Input item cepat, keranjang belanja, kalkulasi kembalian.
   - Mengurangi stok outlet terpilih secara atomik.
   - Struk digital ringkas (tanpa printer struk fisik).
3. **Monitoring Stok Antar-Cabang (Live Dashboard)**:
   - Matriks real-time: Nama Barang | Stok Toko 1 (Gudang) | Stok Toko 2 (Cabang).
   - Indikator peringatan stok menipis (min alert threshold).
4. **Mutasi Barang 3-Tahap (Stock Transfer)**:
   - *REQUEST*: Toko 2 meminta suplai stok.
   - *DISPATCHED*: Toko 1 menyetujui & mengirim barang.
   - *RECEIVED*: Toko 2 memverifikasi fisik & mengonfirmasi penerimaan.
