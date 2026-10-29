---
version: alpha
name: POS-MultiCabang
description: Industrial Clarity meets Retail Utility — Design system spec for Multi-Outlet POS & Inventory.
colors:
  primary: "#047857"
  primary-hover: "#065f46"
  secondary: "#f5f5f4"
  accent-amber: "#92400e"
  accent-amber-bg: "#fef3c7"
  neutral-bg: "#f5f5f4"
  neutral-card: "#ffffff"
  neutral-border: "#e7e5e4"
  text-primary: "#1c1917"
  text-muted: "#78716c"
  status-success: "#047857"
  status-warning: "#d97706"
typography:
  brand-title:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.125rem
    fontWeight: 800
    lineHeight: 1.2
  body-default:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.75rem
    lineHeight: 1.4
  data-mono:
    fontFamily: JetBrains Mono, monospace
    fontSize: 0.6875rem
    letterSpacing: "-0.01em"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-default:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: 16px
  badge-warning:
    backgroundColor: "{colors.accent-amber-bg}"
    textColor: "{colors.accent-amber}"
    rounded: "{rounded.sm}"
  badge-success:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.status-success}"
    rounded: "{rounded.sm}"
  container-viewport:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.text-primary}"
---

# DESIGN.md: POS & Multi-Outlet Inventory

> Panduan arsitektur visual, token desain, dan aturan anti-slop untuk POS dan sistem inventaris multi-outlet.

---

## 1. Identitas & Karakter Desain (Overview)

Sistem dirancang dengan filosofi **Utilitas Ritel Praktis (Retail Utility)**. Pengguna utama adalah kasir toko dan staf gudang yang membutuhkan kecepatan aksi, keterbacaan tinggi di layar smartphone/laptop, dan kontras visual yang jelas.

### Bukan AI Slop:
* Bebas dari karakter em dash di seluruh teks antarmuka maupun instruksi tombol.
* Bebas dari badge kapsul dekoratif tanpa fungsi.
* Bebas dari animasi melayang lambat yang memperlambat alur transaksi kasir.
* Setiap tombol aksi memiliki fungsi yang nyata dan langsung memproses data.

---

## 2. Dial Pengaturan Antarmuka (Three Dials)

* **ENERGY: 2 (Fungsional & Fokus)**. Tata letak bersih dengan kartu berbatas tegas, teks tajam, dan elemen aksi langsung.
* **RHYTHM: 2 (Terstruktur & Padat)**. Penataan grid kasir 2-3 kolom pada katalog produk dan tabel matriks monitoring stok yang mudah dipindai mata.
* **MOTION: 1 (Mikro & Efisien)**. Transisi hover halus pada kartu barang dan tombol aksi tanpa animasi berlebihan.

---

## 3. Palet Warna (Colors)

* **Primary Emerald (`#047857` / `Emerald-700`):**
  * Digunakan untuk tombol utama transaksi, navigasi aktif, dan status stok aman.
* **Accent Amber (`#d97706` / `Amber-600`):**
  * Digunakan untuk peringatan stok menipis (*Alert Minta Tambah*) dan status mutasi menunggu pengiriman.
* **Permukaan & Netral:**
  * Background Viewport: `#f5f5f4` (`Stone-100`).
  * Kartu & Permukaan Data: `#ffffff` dengan border `#e7e5e4` (`Stone-200`).
* **Kontras Aksesibilitas:** Seluruh teks memenuhi standar WCAG AA (>4.5:1 untuk teks normal).

---

## 4. Tipografi (Typography)

* **Font Utama:** `Inter`, `system-ui`, `sans-serif`.
* **Karakter Tipografi:** Bersih, proporsional, dan ringkas untuk layar kasir ponsel.
* **Monospace Fungsional:** Menggunakan font mono untuk data operasional:
  * Kode SKU Barang (e.g. `BRG-001`)
  * Nomor Transaksi Kasir (e.g. `TRX-1029-0831`)
  * Nomor Dokumen Mutasi (e.g. `MUT-20261029-001`)

---

## 5. Tata Letak & Spasi (Layout & Spacing)

1. **Top Header & Switcher:**
   * Bilah tetap di bagian atas memuat nama sistem dan tombol switcher cepat (*Toko 1 (Gudang)* vs *Toko 2 (Cabang)*).
2. **Navigasi Tab Horizontal:**
   * 4 Menu utama: Ringkasan Dashboard, Kasir POS, Monitoring Stok, Mutasi Barang.
3. **Layar Kasir POS (`/`):**
   * Panel Kiri (7 Kolom Desktop / Full Mobile): Input pencarian instan dan grid kartu produk dengan harga jelas.
   * Panel Kanan (5 Kolom Desktop / Bawah Mobile): Keranjang belanja aktif, kalkulasi total harga, input uang tunai, dan tombol penyelesaian transaksi.
4. **Layar Monitoring Stok (`/inventory`):**
   * Tabel matriks perbandingan stok Toko 1 (Pusat) vs Toko 2 (Cabang) dengan lencana status stok.
5. **Layar Mutasi Barang (`/transfers`):**
   * Kartu alur 3-tahap lengkap dengan tombol aksi kirim (*dispatch*) dan terima (*receive*).

---

## 6. Komponen & Interaktivitas (Components)

* **Kartu Produk POS:** Menampilkan SKU mono, nama produk, harga jual tebal hijau, dan klik instan untuk menambahkan ke keranjang.
* **Item Keranjang:** Menampilkan kuantitas, harga satuan, subtotal, dan tombol hapus cepat.
* **Lencana Status Mutasi:**
  * `REQUESTED`: Amber (Menunggu tindakan kirim Toko 1).
  * `DISPATCHED`: Biru (Barang sedang dalam perjalanan).
  * `RECEIVED`: Emerald (Barang telah sampai dan stok Toko 2 bertambah).
