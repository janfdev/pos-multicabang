# DESIGN.md: Linear & BagUI Minimalist Design System

> Sistem Desain Resmi untuk POS Multi-Cabang, Manajemen Logistik & Etalase Omnichannel.
> Mengadopsi filosofi desain **Linear / BagUI / Vercel**: Presisi tinggi, monokromatik netral elegan, tipografi Geist tajam, kontras tinggi, dan dukungan Dark Mode/Light Mode.

---

## 1. Visi & Prinsip Desain

1. **Precision Over Decoration:**
   * Tidak ada gradien warna-warni yang berlebihan atau elemen 3D dekoratif tanpa makna.
   * Informasi angka (stok, rupiah, ID invoice) disajikan dengan *tabular numbers* (`font-mono font-bold tabular-nums`) agar mudah dipindai kasir.
2. **Subtle Depth & Micro-Surfaces:**
   * Di Light Mode: Latar belakang abu-abu netral sangat lembut (`bg-zinc-50` / `bg-zinc-100`), kartu putih bersih (`bg-white`) dengan garis batas tipis (`border-zinc-200/80`), dan bayangan halus (`shadow-[0_1px_2px_rgba(0,0,0,0.04)]`).
   * Di Dark Mode: Latar belakang hitam pekat (`bg-zinc-950`), kartu abu-abu gelap pekat (`bg-zinc-900/90`) dengan garis batas halus (`border-zinc-800`), dan teks putih cemerlang (`text-zinc-100`).
3. **Focused Accentuation:**
   * Aksen utama: **Emerald-500/Emerald-600** untuk transaksi sukses, uang tunai, dan stok aman.
   * Aksen sekunder: **Amber-500** untuk peringatan stok menipis dan **Indigo-500** untuk analitik dan mutasi in-transit.
   * Status badge menggunakan gaya *soft-pill* dengan border halus.
4. **Zero AI Slop:**
   * Bebas dari teks klise, bebas dari elemen kosong yang membuang ruang layar.
   * Navigasi ergonomis satu tangan untuk perangkat kasir mobile/tablet.

---

## 2. Tipografi (Typography)

* **Font Utama (Interface & Headings):** `Geist`, `Inter`, `-apple-system`, `sans-serif`
  * H1 (Page Title): `text-xl sm:text-2xl font-black tracking-tight`
  * H2 (Section Title): `text-base sm:text-lg font-bold tracking-tight`
  * H3 (Card Header): `text-xs sm:text-sm font-semibold`
  * Body Text: `text-xs leading-relaxed text-zinc-600 dark:text-zinc-400`
  * Meta & Labels: `text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500`
* **Font Monospace (Angka, SKU, Transaksi):** `Geist Mono`, `JetBrains Mono`, `monospace`
  * Angka Rupiah: `font-mono font-bold tabular-nums tracking-tight`
  * ID Transaksi / SKU: `font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400`

---

## 3. Palet Warna (Color Tokens)

| Peran | Light Mode | Dark Mode | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#fafafa` (`zinc-50`) | `#09090b` (`zinc-950`) | Latar belakang seluruh halaman |
| **Surface (Card/Modal)** | `#ffffff` (`white`) | `#18181b` (`zinc-900`) | Permukaan kartu, tabel, drawer |
| **Elevated Surface** | `#f4f4f5` (`zinc-100`) | `#27272a` (`zinc-800`) | Header tabel, input form, pill |
| **Border Subtilis** | `#e4e4e7` (`zinc-200`) | `#27272a` (`zinc-800`) | Garis pemisah antar kartu dan tabel |
| **Border Active/Hover** | `#d4d4d8` (`zinc-300`) | `#3f3f46` (`zinc-700`) | Garis fokus input dan tombol hover |
| **Text Primary** | `#09090b` (`zinc-950`) | `#fafafa` (`zinc-50`) | Judul, angka utama, teks penting |
| **Text Muted** | `#71717a` (`zinc-500`) | `#a1a1aa` (`zinc-400`) | Deskripsi, label sekunder |
| **Success / Emerald** | `#059669` / `#ecfdf5` | `#10b981` / `#064e3b` | Tombol checkout, uang tunai, stok aman |
| **Warning / Amber** | `#d97706` / `#fffbeb` | `#f59e0b` / `#78350f` | Peringatan stok kritis, pending transfer |
| **Action / Indigo** | `#4f46e5` / `#eef2ff` | `#6366f1` / `#312e81` | Tombol mutasi kurir, tracking status |

---

## 4. Komponen Antarmuka Kunci (UI Patterns)

### A. Navigation Shell (Sidebar & Header)
* Desktop: Sidebar tetap di sisi kiri dengan lebar 64 (`w-64`), logo kompak, avatar cabang aktif, link navigasi dengan *indicator pill*, tombol cepat *"Buka Toko Online"*, dan toggle **Theme Switcher (Dark/Light)**.
* Mobile: Topbar ringkas setinggi 56px dengan tombol drawer menu dan status cabang aktif.

### B. Metric KPI Cards (Executive & Cashier)
* Kartu dengan border tipis `rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900`.
* Menampilkan nilai numerik besar tebal (`text-2xl font-black font-mono`), ikon latar bergradasi lembut, dan rasio pertumbuhan atau status sub-metrik.

### C. Modern Area Charts (Recharts Spec)
* Garis kurva `type="monotone"`, ketebalan `strokeWidth={2.5}`.
* Gradien area tembus pandang (opacity 25% di atas hingga 0% di bawah).
* Tooltip bertema kaca (`backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg`).
* Grid garis putus-putus sangat samar (`stroke="#e4e4e7"` light, `stroke="#27272a"` dark).

### D. Data Tables & Inventory Matrix
* Header tabel: Latar `bg-zinc-50 dark:bg-zinc-900/60`, teks kapital mini `text-[10px] font-bold text-zinc-400`.
* Baris tabel: Hover efek lembut `hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40`, border bawah tipis.
* Visual Stock Level: Baris dengan progress bar ketersediaan stok cabang vs gudang pusat.

### E. Action Buttons & Inputs
* Tombol Primer: `bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]`.
* Tombol Brand (Emerald POS): `bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs`.
* Input Form: `bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600`.

---

## 5. Implementasi & Roadmap

1. **Fondasi Tema & Font:** Pasang font Geist / Inter via CDN di `index.html`, konfigurasi CSS custom variable untuk dark mode di `src/index.css`, dan state manager tema (`themeStore.ts`).
2. **Navigasi Shell & Root Layout:** Update `src/routes/__root.tsx` dengan estetika Linear, dark mode support, dan selector outlet elegan.
3. **Dashboard Modern:** Rombak `src/routes/dashboard.tsx` dengan KPI cards bergaya Linear, chart bergradien halus, dan feed transaksi modern.
4. **Kasir POS Modern:** Rombak `src/routes/index.tsx` dengan antarmuka kasir tablet-grade, katalog produk bergrid halus, dan keranjang belanja mengambang.
5. **Logistik & Mutasi:** Rombak `src/routes/inventory.tsx` dan `src/routes/transfers.tsx` dengan timeline tracking kurir berestetika modern.
6. **Order Online & Public Store:** Rombak `src/routes/online-orders.tsx` dan `src/routes/shop.tsx` dengan visual customer-facing kelas dunia.
