// Initial Seed Data for POS & Multi-Outlet Inventory API
export const INITIAL_OUTLETS = [
  { id: 'toko-1', name: 'Toko 1 (Pusat & Gudang)', code: 'T1-PUSAT', type: 'STORE_WAREHOUSE', address: 'Jl. Pemuda No. 12, Cirebon' },
  { id: 'toko-2', name: 'Toko 2 (Cabang Satelit)', code: 'T2-CABANG', type: 'STORE_BRANCH', address: 'Jl. Kesambi No. 45, Cirebon' },
];

export const INITIAL_PRODUCTS = [
  { id: 'p-1', sku: 'BRG-001', barcode: '89912345601', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', unit: 'SAK', costPrice: 65000, sellingPrice: 76000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-2', sku: 'BRG-002', barcode: '89912345602', name: 'Minyak Goreng Sawit 2L', category: 'Sembako', unit: 'POUCH', costPrice: 31000, sellingPrice: 36500, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-3', sku: 'BRG-003', barcode: '89912345603', name: 'Gula Pasir Kristal 1kg', category: 'Sembako', unit: 'BKS', costPrice: 15000, sellingPrice: 17500, image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-4', sku: 'BRG-004', barcode: '89912345604', name: 'Tepung Terigu Segitiga 1kg', category: 'Bahan Kue', unit: 'BKS', costPrice: 11500, sellingPrice: 13500, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-5', sku: 'BRG-005', barcode: '89912345605', name: 'Kopi Kapal Api Spesial 165g', category: 'Minuman', unit: 'BKS', costPrice: 14000, sellingPrice: 16500, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-6', sku: 'BRG-006', barcode: '89912345606', name: 'Susu Kental Manis Putih 370g', category: 'Minuman', unit: 'KALENG', costPrice: 11000, sellingPrice: 13000, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-7', sku: 'BRG-007', barcode: '89912345607', name: 'Mie Instan Goreng Spesial', category: 'Makanan Cepat', unit: 'DUS', costPrice: 108000, sellingPrice: 122000, image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-8', sku: 'BRG-008', barcode: '89912345608', name: 'Kecap Manis Botol 600ml', category: 'Bumbu Dapur', unit: 'BOTOL', costPrice: 20000, sellingPrice: 24000, image: 'https://images.unsplash.com/photo-1627662168285-8a8b843355be?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-9', sku: 'BRG-009', barcode: '89912345609', name: 'Sabun Cuci Piring Jeruk Nipis 780ml', category: 'Kebersihan', unit: 'POUCH', costPrice: 13500, sellingPrice: 16000, image: 'https://images.unsplash.com/photo-1585670270677-b469b360b2ac?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-10', sku: 'BRG-010', barcode: '89912345610', name: 'Deterjen Bubuk Konsentrat 800g', category: 'Kebersihan', unit: 'BKS', costPrice: 17500, sellingPrice: 21000, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-11', sku: 'BRG-011', barcode: '89912345611', name: 'Telur Ayam Ras 1 Tray (30 butir)', category: 'Sembako', unit: 'TRAY', costPrice: 48000, sellingPrice: 55000, image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80' },
  { id: 'p-12', sku: 'BRG-012', barcode: '89912345612', name: 'Biskuit Kaleng Aneka Rasa 350g', category: 'Snack', unit: 'KALENG', costPrice: 38000, sellingPrice: 46000, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80' },
];

export const INITIAL_INVENTORY: Record<string, { t1Stock: number; t2Stock: number; minAlert: number }> = {
  'p-1': { t1Stock: 85, t2Stock: 4, minAlert: 6 },
  'p-2': { t1Stock: 120, t2Stock: 3, minAlert: 10 },
  'p-3': { t1Stock: 95, t2Stock: 18, minAlert: 10 },
  'p-4': { t1Stock: 60, t2Stock: 5, minAlert: 8 },
  'p-5': { t1Stock: 50, t2Stock: 14, minAlert: 8 },
  'p-6': { t1Stock: 72, t2Stock: 22, minAlert: 12 },
  'p-7': { t1Stock: 40, t2Stock: 2, minAlert: 5 },
  'p-8': { t1Stock: 65, t2Stock: 16, minAlert: 8 },
  'p-9': { t1Stock: 80, t2Stock: 9, minAlert: 10 },
  'p-10': { t1Stock: 55, t2Stock: 19, minAlert: 8 },
  'p-11': { t1Stock: 30, t2Stock: 3, minAlert: 5 },
  'p-12': { t1Stock: 45, t2Stock: 11, minAlert: 6 },
};

export const INITIAL_TRANSFERS: any[] = [
  {
    id: 'MUT-20261029-001',
    fromOutletId: 'toko-1',
    toOutletId: 'toko-2',
    type: 'RESTOCK',
    status: 'REQUESTED',
    courierName: null,
    notes: 'Restock harian Toko 2 (Minyak Goreng & Beras menipis)',
    items: [
      { productId: 'p-1', productName: 'Beras Pandan Wangi 5kg', qtyRequested: 20, qtyDispatched: 0, qtyReceived: 0 },
      { productId: 'p-2', productName: 'Minyak Goreng Sawit 2L', qtyRequested: 30, qtyDispatched: 0, qtyReceived: 0 },
      { productId: 'p-7', productName: 'Mie Instan Goreng Spesial', qtyRequested: 10, qtyDispatched: 0, qtyReceived: 0 },
    ],
    requestedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'MUT-20261028-002',
    fromOutletId: 'toko-1',
    toOutletId: 'toko-2',
    type: 'RESTOCK',
    status: 'DISPATCHED',
    courierName: 'Ahmad (Armada Gudang Pusat)',
    dispatchedBy: 'Kepala Gudang Toko 1',
    notes: 'Pengiriman batch sore bahan sembako & sabun',
    items: [
      { productId: 'p-3', productName: 'Gula Pasir Kristal 1kg', qtyRequested: 25, qtyDispatched: 25, qtyReceived: 0 },
      { productId: 'p-9', productName: 'Sabun Cuci Piring Jeruk Nipis 780ml', qtyRequested: 20, qtyDispatched: 20, qtyReceived: 0 },
    ],
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    dispatchedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'MUT-20261027-003',
    fromOutletId: 'toko-1',
    toOutletId: 'toko-2',
    type: 'RESTOCK',
    status: 'RECEIVED',
    courierName: 'Ahmad (Armada Gudang Pusat)',
    dispatchedBy: 'Kepala Gudang Toko 1',
    receivedBy: 'Kasir Toko 2',
    notes: 'Pengiriman rutin awal pekan',
    items: [
      { productId: 'p-5', productName: 'Kopi Kapal Api Spesial 165g', qtyRequested: 15, qtyDispatched: 15, qtyReceived: 15 },
      { productId: 'p-6', productName: 'Susu Kental Manis Putih 370g', qtyRequested: 20, qtyDispatched: 20, qtyReceived: 20 },
    ],
    requestedAt: new Date(Date.now() - 172800000).toISOString(),
    dispatchedAt: new Date(Date.now() - 150000000).toISOString(),
    receivedAt: new Date(Date.now() - 140000000).toISOString(),
  },
];

export const INITIAL_ORDERS: any[] = [
  {
    id: 'TRX-1029-0831',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    status: 'COMPLETED',
    totalAmount: 129500,
    paymentMethod: 'CASH',
    cashReceived: 150000,
    cashChange: 20500,
    items: [
      { productId: 'p-1', productName: 'Beras Pandan Wangi 5kg', qty: 1, unitPrice: 76000, subtotal: 76000 },
      { productId: 'p-2', productName: 'Minyak Goreng Sawit 2L', qty: 1, unitPrice: 36500, subtotal: 36500 },
      { productId: 'p-3', productName: 'Gula Pasir Kristal 1kg', qty: 1, unitPrice: 17000, subtotal: 17000 },
    ],
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'TRX-1029-0820',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    status: 'COMPLETED',
    totalAmount: 244000,
    paymentMethod: 'QRIS',
    cashReceived: 244000,
    cashChange: 0,
    items: [
      { productId: 'p-7', productName: 'Mie Instan Goreng Spesial', qty: 2, unitPrice: 122000, subtotal: 244000 },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'TRX-1029-0812',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    status: 'COMPLETED',
    totalAmount: 55000,
    paymentMethod: 'CASH',
    cashReceived: 60000,
    cashChange: 5000,
    items: [
      { productId: 'p-11', productName: 'Telur Ayam Ras 1 Tray (30 butir)', qty: 1, unitPrice: 55000, subtotal: 55000 },
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const INITIAL_SALES_TREND = [
  { day: 'Sen', toko1: 2450000, toko2: 1200000 },
  { day: 'Sel', toko1: 2800000, toko2: 1450000 },
  { day: 'Rab', toko1: 3100000, toko2: 1650000 },
  { day: 'Kam', toko1: 2900000, toko2: 1800000 },
  { day: 'Jum', toko1: 3800000, toko2: 2400000 },
  { day: 'Sab', toko1: 5200000, toko2: 3600000 },
  { day: 'Min (Hari Ini)', toko1: 4600000, toko2: 3200000 },
];
