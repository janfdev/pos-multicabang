import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Store,
  Building2,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  ArrowRight,
  X,
  AlertCircle,
  MessageCircle,
  Sun,
  Moon,
  Clock,
  QrCode,
  CreditCard,
  Banknote,
  Check,
  ChevronRight,
  Sparkles,
  Wheat,
  Coffee,
  Cake,
  Flame,
  UtensilsCrossed,
  Cookie,
  Package,
  Lock,
  LayoutDashboard,
  Star,
  Eye,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react';
import { themeStore, Theme } from '@/lib/themeStore';
import { authStore, UserProfile } from '@/lib/authStore';
import { playBeep } from '@/lib/audio';

export const Route = createFileRoute('/shop')({
  component: PublicShopPage,
});

const font = {
  fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",
} as const;

export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
  stock: number;
  isLow: boolean;
  image?: string;
  outletId: 'toko-1' | 'toko-2';
  outletName: string;
  outletLocation: string;
  rating: number;
  soldCount: number;
  description: string;
  specification: {
    packaging: string;
    weight: string;
    shelfLife: string;
    origin: string;
  };
  t1Stock: number;
  t2Stock: number;
}

export const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  'p-1': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
  'p-2': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
  'p-3': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
  'p-4': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'p-5': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
  'p-6': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
  'p-7': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
  'p-8': 'https://images.unsplash.com/photo-1627662168285-8a8b843355be?w=500&auto=format&fit=crop&q=80',
  'p-9': 'https://images.unsplash.com/photo-1585670270677-b469b360b2ac?w=500&auto=format&fit=crop&q=80',
  'p-10': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80',
  'p-11': 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
  'p-12': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
};

export const INITIAL_SEMBAKO_PRODUCTS: ProductItem[] = [
  {
    id: 'p-1',
    sku: 'BRG-001',
    barcode: '89912345601',
    name: 'Beras Pandan Wangi 5kg',
    category: 'Sembako',
    unit: 'SAK',
    sellingPrice: 76000,
    stock: 85,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 4.9,
    soldCount: 420,
    description: 'Beras Pandan Wangi murni kualitas premium pilihan tanpa pemutih, tanpa pengawet, dan tanpa pewangi sintetis. Pulen, wangi pandan alami, sangat cocok untuk konsumsi harian keluarga dan usaha kuliner.',
    specification: {
      packaging: 'Karung Sak Tebal 5 kg',
      weight: '5 kg',
      shelfLife: '12 Bulan',
      origin: 'Cianjur / Jawa Barat',
    },
    t1Stock: 85,
    t2Stock: 4,
  },
  {
    id: 'p-2',
    sku: 'BRG-002',
    barcode: '89912345602',
    name: 'Minyak Goreng Sawit 2L',
    category: 'Sembako',
    unit: 'POUCH',
    sellingPrice: 36500,
    stock: 18,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.8,
    soldCount: 650,
    description: 'Minyak goreng kelapa sawit bermutu tinggi melalui 2 kali penyaringan higienis. Menghasilkan gorengan renyah, jernih, tahan panas, dan kaya Vitamin A & E alami.',
    specification: {
      packaging: 'Pouch Refill 2 Liter',
      weight: '2 Liter (1.8 kg)',
      shelfLife: '18 Bulan',
      origin: 'Produksi Nasional SNI',
    },
    t1Stock: 40,
    t2Stock: 18,
  },
  {
    id: 'p-3',
    sku: 'BRG-003',
    barcode: '89912345603',
    name: 'Gula Pasir Kristal 1kg',
    category: 'Sembako',
    unit: 'BKS',
    sellingPrice: 17500,
    stock: 60,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 4.9,
    soldCount: 510,
    description: 'Gula kristal putih murni dari tebu alami pilihan. Butiran halus bersih, mudah larut, dan memberikan rasa manis alami higienis untuk aneka minuman dan masakan.',
    specification: {
      packaging: 'Plastik Higienis 1 kg',
      weight: '1.000 gram',
      shelfLife: '24 Bulan',
      origin: 'PTPN / Industri Gula Nasional',
    },
    t1Stock: 60,
    t2Stock: 25,
  },
  {
    id: 'p-4',
    sku: 'BRG-004',
    barcode: '89912345604',
    name: 'Tepung Terigu Segitiga 1kg',
    category: 'Bahan Kue',
    unit: 'BKS',
    sellingPrice: 13500,
    stock: 14,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.9,
    soldCount: 380,
    description: 'Tepung terigu serbaguna berprotein sedang. Cocok untuk aneka kue, martabak, bolu, gorengan, dan mie rumahan dengan tekstur kenyal dan lembut sempurna.',
    specification: {
      packaging: 'Kemasan Pack 1 kg',
      weight: '1 kg',
      shelfLife: '12 Bulan',
      origin: 'Bogasari',
    },
    t1Stock: 35,
    t2Stock: 14,
  },
  {
    id: 'p-5',
    sku: 'BRG-005',
    barcode: '89912345605',
    name: 'Kopi Kapal Api Spesial 165g',
    category: 'Minuman',
    unit: 'BKS',
    sellingPrice: 16500,
    stock: 50,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 4.9,
    soldCount: 890,
    description: 'Kopi bubuk hitam mantap terbuat dari paduan biji kopi robusta dan arabika pilihan. Aroma khas harum pekat untuk penyemangat aktivitas harian.',
    specification: {
      packaging: 'Pouch Alumunium Foil 165g',
      weight: '165 gram',
      shelfLife: '12 Bulan',
      origin: 'Santos Jaya Abadi',
    },
    t1Stock: 50,
    t2Stock: 22,
  },
  {
    id: 'p-6',
    sku: 'BRG-006',
    barcode: '89912345606',
    name: 'Susu Kental Manis Putih 370g',
    category: 'Minuman',
    unit: 'KALENG',
    sellingPrice: 13000,
    stock: 19,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.8,
    soldCount: 430,
    description: 'Susu kental manis lezat bernutrisi dengan kalsium dan vitamin D3. Nikmat dicampur dengan kopi, teh tarik, es campur, atau topping roti bakar.',
    specification: {
      packaging: 'Kaleng 370g',
      weight: '370 gram',
      shelfLife: '12 Bulan',
      origin: 'Frisian Flag Indonesia',
    },
    t1Stock: 45,
    t2Stock: 19,
  },
  {
    id: 'p-7',
    sku: 'BRG-007',
    barcode: '89912345607',
    name: 'Mie Instan Goreng Spesial',
    category: 'Makanan Cepat',
    unit: 'DUS',
    sellingPrice: 122000,
    stock: 25,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 5.0,
    soldCount: 720,
    description: 'Mi instan goreng legendaris nomor satu di Indonesia. 1 karton isi 40 bungkus segel pabrik. Bumbu rempah lengkap dengan bawang goreng renyah dan kecap manis asli.',
    specification: {
      packaging: 'Karton Dus Isi 40 Bungkus',
      weight: '3.4 kg (40 x 85g)',
      shelfLife: '8 Bulan',
      origin: 'Indofood',
    },
    t1Stock: 25,
    t2Stock: 10,
  },
  {
    id: 'p-8',
    sku: 'BRG-008',
    barcode: '89912345608',
    name: 'Kecap Manis Botol 600ml',
    category: 'Bumbu Dapur',
    unit: 'BOTOL',
    sellingPrice: 24000,
    stock: 12,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1627662168285-8a8b843355be?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.9,
    soldCount: 310,
    description: 'Kecap manis kental hitam pekat dari kedelai hitam Malika pilihan. Memberikan warna karamel mengkilap dan rasa manis gurih meresap sempurna.',
    specification: {
      packaging: 'Botol Kaca / Plastik Tebal 600ml',
      weight: '600 ml',
      shelfLife: '24 Bulan',
      origin: 'Unilever Indonesia',
    },
    t1Stock: 30,
    t2Stock: 12,
  },
  {
    id: 'p-9',
    sku: 'BRG-009',
    barcode: '89912345609',
    name: 'Sabun Cuci Piring Jeruk Nipis 780ml',
    category: 'Kebersihan',
    unit: 'POUCH',
    sellingPrice: 16000,
    stock: 40,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1585670270677-b469b360b2ac?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 4.9,
    soldCount: 540,
    description: 'Cairan pencuci piring formula ekstrak jeruk nipis asli. Meluruhkan lemak membandel 5x lebih cepat tanpa meninggalkan bau amis pada piring dan sendok.',
    specification: {
      packaging: 'Pouch Refill 780ml',
      weight: '780 ml',
      shelfLife: '24 Bulan',
      origin: 'Sunlight Indonesia',
    },
    t1Stock: 40,
    t2Stock: 15,
  },
  {
    id: 'p-10',
    sku: 'BRG-010',
    barcode: '89912345610',
    name: 'Deterjen Bubuk Konsentrat 800g',
    category: 'Kebersihan',
    unit: 'BKS',
    sellingPrice: 21000,
    stock: 12,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.8,
    soldCount: 290,
    description: 'Deterjen konsentrat penghilang noda membandel 1x kucek dengan aroma pelembut Molto floral yang harum tahan hingga 21 hari pada serat pakaian.',
    specification: {
      packaging: 'Pack Plastik 800g',
      weight: '800 gram',
      shelfLife: '24 Bulan',
      origin: 'Rinso Indonesia',
    },
    t1Stock: 35,
    t2Stock: 12,
  },
  {
    id: 'p-11',
    sku: 'BRG-011',
    barcode: '89912345611',
    name: 'Telur Ayam Ras 1 Tray (30 butir)',
    category: 'Sembako',
    unit: 'TRAY',
    sellingPrice: 55000,
    stock: 20,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    outletLocation: 'Jl. Pemuda, Kota Cirebon',
    rating: 4.9,
    soldCount: 610,
    description: 'Telur ayam negeri segar langsung dari peternakan terpercaya. Cangkang bersih coklat tebal, kuning telur pekat bernutrisi tinggi, dipacking aman dalam tray karton 30 butir.',
    specification: {
      packaging: 'Tray Karton Ramah Lingkungan 30 Butir',
      weight: 'Sekitar 1.8 - 2.0 kg',
      shelfLife: '21 Hari (Suhu Ruang) / 35 Hari (Kulkas)',
      origin: 'Peternakan Lokal Cirebon',
    },
    t1Stock: 20,
    t2Stock: 7,
  },
  {
    id: 'p-12',
    sku: 'BRG-012',
    barcode: '89912345612',
    name: 'Biskuit Kaleng Aneka Rasa 350g',
    category: 'Snack',
    unit: 'KALENG',
    sellingPrice: 46000,
    stock: 14,
    isLow: false,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    outletLocation: 'Jl. Kesambi, Kota Cirebon',
    rating: 4.7,
    soldCount: 180,
    description: 'Biskuit renyah gurih rasa kelapa dengan aroma butter lezat dan taburan gula kristal renyah. Sangat pas untuk teman minum teh dan kopi bersama keluarga.',
    specification: {
      packaging: 'Kaleng Segel Kedap Udara 350g',
      weight: '350 gram',
      shelfLife: '15 Bulan',
      origin: 'Mayora',
    },
    t1Stock: 30,
    t2Stock: 14,
  },
];

interface CartItem {
  product: ProductItem;
  qty: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ALL: ShoppingBag,
  Sembako: Wheat,
  Minuman: Coffee,
  'Bahan Kue': Cake,
  'Bumbu Dapur': Flame,
  Kebersihan: Sparkles,
  'Makanan Cepat': UtensilsCrossed,
  Snack: Cookie,
};

export function PublicShopPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_SEMBAKO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<'ALL' | 'toko-1' | 'toko-2'>('ALL');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeStore.getTheme());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authStore.getUser());

  // Active Product for Marketplace Detail Modal
  const [activeDetailProduct, setActiveDetailProduct] = useState<ProductItem | null>(null);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'TRANSFER' | 'CASH'>('QRIS');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const unsub = themeStore.subscribe((t) => setCurrentTheme(t));
    const unsubAuth = authStore.subscribe((u) => setCurrentUser(u));
    return () => {
      unsub();
      unsubAuth();
    };
  }, []);

  const fetchCatalog = () => {
    fetch(`/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with rich marketplace details
          const merged = data.map((apiItem) => {
            const initial = INITIAL_SEMBAKO_PRODUCTS.find((p) => p.id === apiItem.id);
            return {
              ...apiItem,
              outletId: initial?.outletId || (apiItem.id.charCodeAt(apiItem.id.length - 1) % 2 === 0 ? 'toko-2' : 'toko-1'),
              outletName: initial?.outletName || (apiItem.id.charCodeAt(apiItem.id.length - 1) % 2 === 0 ? 'Toko 2 (Cabang Satelit)' : 'Toko 1 (Pusat & Gudang)'),
              outletLocation: initial?.outletLocation || (apiItem.id.charCodeAt(apiItem.id.length - 1) % 2 === 0 ? 'Jl. Kesambi, Cirebon' : 'Jl. Pemuda, Cirebon'),
              rating: initial?.rating || 4.9,
              soldCount: initial?.soldCount || 350,
              description: initial?.description || `${apiItem.name} kualitas pilihan segar dan bermutu untuk kebutuhan sembako keluarga Anda.`,
              specification: initial?.specification || {
                packaging: `Pack Standard ${apiItem.unit}`,
                weight: `1 ${apiItem.unit}`,
                shelfLife: '12 Bulan',
                origin: 'Produsen Terpercaya',
              },
              t1Stock: apiItem.t1Stock ?? initial?.t1Stock ?? apiItem.stock ?? 20,
              t2Stock: apiItem.t2Stock ?? initial?.t2Stock ?? 10,
              image: apiItem.image || initial?.image || FALLBACK_PRODUCT_IMAGES[apiItem.id],
            };
          });
          setProducts(merged);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts(INITIAL_SEMBAKO_PRODUCTS);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Cart Actions
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) return;
    playBeep(1400, 0.05);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    playBeep(delta > 0 ? 1500 : 900, 0.04);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.qty,
    0
  );

  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchStore = selectedStoreFilter === 'ALL' || p.outletId === selectedStoreFilter;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStore && matchSearch;
    });
  }, [products, selectedCategory, selectedStoreFilter, searchQuery]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError('Keranjang Anda masih kosong.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Harap lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      setCheckoutError('Alamat pengiriman wajib diisi untuk layanan kurir.');
      return;
    }

    setIsSubmitting(true);

    // Primary outlet is determined by the first item's store or customer selection
    const primaryOutlet = cart[0]?.product.outletId || 'toko-1';

    try {
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: primaryOutlet,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          fulfillmentType,
          deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : null,
          notes: orderNotes.trim() ? `[${paymentMethod}] ${orderNotes.trim()}` : `[${paymentMethod}]`,
          items: cart.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playBeep(1200, 0.15);
        setCompletedOrder(data.order);
        setCart([]);
        setIsCartOpen(false);
      } else {
        setCheckoutError(data.error || 'Gagal membuat pesanan online.');
      }
    } catch {
      setCheckoutError('Terjadi gangguan jaringan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  return (
    <div style={font} className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 font-sans pb-28 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/brand-logo.svg" alt="POS Logo" className="size-9 rounded-xl shadow-xs shrink-0 object-contain" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm leading-tight text-gray-900 dark:text-neutral-50 tracking-tight truncate">
                  Pasar Sembako Online
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                  Official Store
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                Belanja sembako segar multi-toko dengan harga grosir resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = currentTheme === 'dark' ? 'light' : 'dark';
                themeStore.setTheme(next);
                setCurrentTheme(next);
              }}
              className="p-2 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors shadow-2xs"
              title="Ganti Tema Terang/Gelap"
            >
              {currentTheme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            {/* Portal Staf & Kasir */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/pos"
                  className="px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Store className="size-3.5" />
                  <span className="hidden sm:inline">Kasir POS</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs flex items-center gap-1.5"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-gray-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs flex items-center gap-1.5"
              >
                <Lock className="size-3.5" />
                <span>Portal Kasir &amp; Staf</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Search Bar & Sticky Category & Store Filter */}
        <div className="space-y-2.5 sticky top-14 z-20 bg-gray-50/95 dark:bg-neutral-950/95 backdrop-blur-md pt-2 pb-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari sembako murah (beras, minyak, gula, tepung, telur, mi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-neutral-100/10 focus:border-gray-900 dark:focus:border-neutral-100 font-medium shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Store Filter Tabs (Clean marketplace pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Store className="size-3" />
              Lokasi Toko:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedStoreFilter === 'ALL'
                  ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200/80 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              Semua Toko ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('toko-1')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedStoreFilter === 'toko-1'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200/80 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Building2 className="size-3" />
              <span>Toko 1 (Pusat &amp; Gudang)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('toko-2')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedStoreFilter === 'toko-2'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200/80 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Store className="size-3" />
              <span>Toko 2 (Cabang Satelit)</span>
            </button>
          </div>

          {/* Category Horizontal Scroll Pills */}
          <div className="overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 w-fit">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const IconComponent = CATEGORY_ICONS[cat] || Package;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                        : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200/80 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <IconComponent className="size-3.5 shrink-0" />
                    <span>{cat === 'ALL' ? 'Semua Kategori' : cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs">
            Memuat etalase sembako...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs">
            Tidak ada produk yang cocok dengan pencarian atau filter toko yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id);
              const isAvailable = p.stock > 0;
              const isLowStock = isAvailable && p.stock <= 5;
              const imgSrc = p.image || FALLBACK_PRODUCT_IMAGES[p.id] || FALLBACK_PRODUCT_IMAGES['p-1'];

              return (
                <div
                  key={p.id}
                  className="p-3.5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-all group overflow-hidden"
                >
                  <div className="space-y-2.5">
                    {/* Real Product Photo with Store Badge */}
                    <div
                      onClick={() => setActiveDetailProduct(p)}
                      className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800/80 cursor-pointer"
                    >
                      <img
                        src={imgSrc}
                        alt={p.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                        }}
                      />
                      {/* Category Badge Top Left */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-gray-700 dark:text-neutral-300 shadow-2xs uppercase tracking-wider">
                        {p.category}
                      </span>

                      {/* Store Origin Badge Top Right */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-neutral-900/95 text-gray-800 dark:text-neutral-200 backdrop-blur-md shadow-2xs border border-gray-200/60 dark:border-neutral-700/60">
                        {p.outletId === 'toko-1' ? (
                          <Building2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Store className="size-3 text-blue-600 dark:text-blue-400" />
                        )}
                        <span>{p.outletId === 'toko-1' ? 'Toko 1 (Pusat)' : 'Toko 2 (Cabang)'}</span>
                      </div>
                    </div>

                    {/* Store Name & Location Line */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                      <BadgeCheck className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{p.outletName}</span>
                      <span>&bull;</span>
                      <span className="text-gray-400 shrink-0">{p.outletLocation}</span>
                    </div>

                    {/* Product Title */}
                    <div>
                      <h3
                        onClick={() => setActiveDetailProduct(p)}
                        className="font-extrabold text-sm text-gray-900 dark:text-neutral-100 leading-snug line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {p.name}
                      </h3>
                      <p className="font-mono text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">
                        SKU: {p.sku} &bull; Satuan: {p.unit}
                      </p>
                    </div>

                    {/* Ratings & Sold Count & Stock Pill */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                      <span className="text-gray-500 dark:text-neutral-400 font-medium">
                        {p.soldCount}+ terjual
                      </span>
                      <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          !isAvailable
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {!isAvailable ? 'Habis' : `Stok: ${p.stock} ${p.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 block">Harga</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-extrabold text-base text-gray-900 dark:text-neutral-50">
                          {formatRupiah(p.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">/{p.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveDetailProduct(p)}
                        className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Lihat Spesifikasi & Detail Toko"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Detail</span>
                      </button>

                      {inCart ? (
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-gray-200/60 dark:border-neutral-700/60">
                          <button
                            type="button"
                            onClick={() => updateCartQty(p.id, -1)}
                            className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="font-mono font-extrabold text-xs px-1.5 text-gray-900 dark:text-neutral-50 min-w-4 text-center">
                            {inCart.qty}
                          </span>
                          <button
                            type="button"
                            disabled={inCart.qty >= p.stock}
                            onClick={() => updateCartQty(p.id, 1)}
                            className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={p.stock <= 0}
                          onClick={() => addToCart(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-40 active:scale-95"
                        >
                          <Plus className="size-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto bg-gray-900/95 dark:bg-neutral-100/95 backdrop-blur-md text-white dark:text-neutral-900 p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 pointer-events-auto border border-white/10 dark:border-black/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="size-4.5 text-emerald-400 dark:text-emerald-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-gray-300 dark:text-neutral-600 font-medium block">
                  Keranjang ({totalCartCount} item)
                </span>
                <span className="font-mono font-extrabold text-sm truncate block">
                  {formatRupiah(totalCartAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
            >
              <span>Lihat &amp; Checkout</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal (Real Marketplace Experience) */}
      <AnimatePresence>
        {activeDetailProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800 dark:text-neutral-200">
                    Informasi Produk &amp; Toko Pengirim
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetailProduct(null)}
                  className="size-8 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Big Packshot Photo */}
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800">
                    <img
                      src={activeDetailProduct.image || FALLBACK_PRODUCT_IMAGES[activeDetailProduct.id]}
                      alt={activeDetailProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-gray-700 dark:text-neutral-300 uppercase tracking-wider">
                      {activeDetailProduct.category}
                    </span>
                  </div>

                  {/* Core Info */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {activeDetailProduct.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                      <span className="text-gray-500 dark:text-neutral-400 font-medium">
                        {activeDetailProduct.soldCount}+ Terjual
                      </span>
                      <span className="text-gray-300 dark:text-neutral-700">&bull;</span>
                      <span className="font-mono text-gray-400 text-[11px]">
                        {activeDetailProduct.sku}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-neutral-50 leading-snug">
                      {activeDetailProduct.name}
                    </h2>

                    <div className="p-3 bg-gray-50 dark:bg-neutral-800/60 rounded-2xl border border-gray-100 dark:border-neutral-800">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Harga Satuan</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(activeDetailProduct.sellingPrice)}
                        </span>
                        <span className="text-xs text-gray-500 font-mono font-semibold">/{activeDetailProduct.unit}</span>
                      </div>
                    </div>

                    {/* Store Origin Profile */}
                    <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                            {activeDetailProduct.outletName}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          Official Store
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-400 flex items-center gap-1">
                        <MapPin className="size-3 text-gray-400 shrink-0" />
                        <span>{activeDetailProduct.outletLocation}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock per Outlet Comparison */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    Ketersediaan Stok di Jaringan Toko:
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-neutral-300">
                          <Building2 className="size-3.5 text-emerald-600" />
                          Toko 1 (Pusat &amp; Gudang)
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {activeDetailProduct.t1Stock} {activeDetailProduct.unit}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-neutral-300">
                          <Store className="size-3.5 text-blue-600" />
                          Toko 2 (Cabang Satelit)
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {activeDetailProduct.t2Stock} {activeDetailProduct.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specification Table */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    Spesifikasi Sembako:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 dark:bg-neutral-800/40 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <span className="text-[10px] text-gray-400 block">Kemasan</span>
                      <span className="font-semibold text-gray-900 dark:text-neutral-100">{activeDetailProduct.specification.packaging}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-neutral-800/40 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <span className="text-[10px] text-gray-400 block">Berat Bersih</span>
                      <span className="font-semibold text-gray-900 dark:text-neutral-100">{activeDetailProduct.specification.weight}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-neutral-800/40 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <span className="text-[10px] text-gray-400 block">Masa Simpan</span>
                      <span className="font-semibold text-gray-900 dark:text-neutral-100">{activeDetailProduct.specification.shelfLife}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-neutral-800/40 rounded-xl border border-gray-100 dark:border-neutral-800">
                      <span className="text-[10px] text-gray-400 block">Asal / Merek</span>
                      <span className="font-semibold text-gray-900 dark:text-neutral-100">{activeDetailProduct.specification.origin}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    Deskripsi Produk:
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed bg-gray-50/50 dark:bg-neutral-800/20 p-3 rounded-2xl border border-gray-100 dark:border-neutral-800/60">
                    {activeDetailProduct.description}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-gray-50/60 dark:bg-neutral-800/40">
                <div>
                  <span className="text-[10px] text-gray-400 block">Harga</span>
                  <span className="font-mono font-extrabold text-base text-gray-900 dark:text-neutral-100">
                    {formatRupiah(activeDetailProduct.sellingPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDetailProduct(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(activeDetailProduct);
                      setActiveDetailProduct(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="size-4" />
                    <span>+ Masukkan Keranjang</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart & Checkout Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/60 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 flex items-center justify-center">
                    <ShoppingBag className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-neutral-50">
                      Keranjang Belanja
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Total {totalCartCount} item barang sembako
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="size-8 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {checkoutError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2 text-xs">
                    <AlertCircle className="size-4 text-rose-600 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                      Daftar Barang ({cart.length} SKU):
                    </span>
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer"
                    >
                      Kosongkan Keranjang
                    </button>
                  </div>

                  {cart.map((item) => {
                    const cartImg = item.product.image || FALLBACK_PRODUCT_IMAGES[item.product.id] || FALLBACK_PRODUCT_IMAGES['p-1'];
                    return (
                      <div
                        key={item.product.id}
                        className="p-2.5 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-200/60 dark:border-neutral-800 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={cartImg}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="size-11 rounded-xl object-cover shrink-0 border border-gray-200/80 dark:border-neutral-700 bg-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-neutral-100 truncate text-xs">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-neutral-400 mt-0.5">
                              {item.product.outletId === 'toko-1' ? (
                                <Building2 className="size-3 text-emerald-600" />
                              ) : (
                                <Store className="size-3 text-blue-600" />
                              )}
                              <span>{item.product.outletName}</span>
                            </div>
                            <span className="font-mono text-[11px] text-gray-500 dark:text-neutral-400 block mt-0.5">
                              {formatRupiah(item.product.sellingPrice)} &times; {item.qty} ={' '}
                              <strong className="text-gray-900 dark:text-neutral-50 font-bold">
                                {formatRupiah(item.product.sellingPrice * item.qty)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-5 text-center text-gray-900 dark:text-neutral-50">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            disabled={item.qty >= item.product.stock}
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="size-6 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-neutral-300 font-bold cursor-pointer disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, -item.qty)}
                            className="size-6 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer ml-1"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  {/* Fulfillment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Metode Pemenuhan:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('PICKUP')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          fulfillmentType === 'PICKUP'
                            ? 'border-gray-900 dark:border-neutral-100 bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Store className="size-4" />
                        <span>Ambil di Toko (Pickup)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('DELIVERY')}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          fulfillmentType === 'DELIVERY'
                            ? 'border-gray-900 dark:border-neutral-100 bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                            : 'border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Truck className="size-4" />
                        <span>Kirim Kurir (Delivery)</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Nama Pemesan *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ibu Siti / Bpk Budi"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Nomor WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="08123456789"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address if Delivery */}
                  {fulfillmentType === 'DELIVERY' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                        Alamat Lengkap Pengiriman *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-2.5 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                      />
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                      Metode Pembayaran:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'QRIS'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <QrCode className="size-4" />
                        <span>QRIS Instan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('TRANSFER')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'TRANSFER'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <CreditCard className="size-4" />
                        <span>Transfer Bank</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'CASH'
                            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        <Banknote className="size-4" />
                        <span>Bayar Tunai</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-neutral-400">
                      Catatan Pesanan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Beras minta karung yang baru, telur jangan pecah..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-neutral-50 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-100"
                    />
                  </div>
                </form>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-500 dark:text-neutral-400">Total Pembayaran</span>
                  <span className="font-mono font-extrabold text-base text-gray-900 dark:text-neutral-50">
                    {formatRupiah(totalCartAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Memproses Pesanan...</span>
                  ) : (
                    <>
                      <span>Konfirmasi Pesanan Sembako</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Order Modal with Direct WhatsApp Routing */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 space-y-4 text-center"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-neutral-50">
                  Pesanan Berhasil Dibuat!
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  ID Pesanan:{' '}
                  <strong className="font-mono text-gray-800 dark:text-neutral-200 font-bold">
                    {completedOrder.id}
                  </strong>
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-neutral-800/60 rounded-2xl border border-gray-100 dark:border-neutral-800 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Pemesan:</span>
                  <span className="font-bold text-gray-800 dark:text-neutral-200">
                    {completedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Layanan:</span>
                  <span className="font-bold text-gray-800 dark:text-neutral-200">
                    {completedOrder.fulfillmentType}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200/60 dark:border-neutral-700/60 pt-1.5">
                  <span className="text-gray-400 font-sans">Total Tagihan:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(completedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/6281234567801?text=${encodeURIComponent(
                    `Halo Admin Toko Sembako, saya sudah membuat pesanan dengan ID: *${completedOrder.id}* atas nama *${completedOrder.customerName}* sejumlah *${formatRupiah(
                      completedOrder.totalAmount
                    )}*. Mohon diproses ya. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>Kirim Rincian ke WhatsApp Toko</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-pointer"
                >
                  Tutup &amp; Kembali Belanja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
