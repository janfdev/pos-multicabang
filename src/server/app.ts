import { Hono } from 'hono';
import { cors } from 'hono/cors';

export const app = new Hono().basePath('/api');

app.use('*', cors());

// Health Check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    system: 'POS & Multi-Outlet Inventory API',
    timestamp: new Date().toISOString(),
  });
});

// Mock Initial Data State
const MOCK_OUTLETS = [
  { id: 'toko-1', name: 'Toko 1 (Pusat & Gudang)', code: 'T1-PUSAT', type: 'STORE_WAREHOUSE' },
  { id: 'toko-2', name: 'Toko 2 (Cabang Satelit)', code: 'T2-CABANG', type: 'STORE_BRANCH' },
];

let MOCK_PRODUCTS = [
  { id: 'p-1', sku: 'BRG-001', barcode: '89912345601', name: 'Beras Premium 5kg', category: 'Sembako', unit: 'SAK', costPrice: 62000, sellingPrice: 72000 },
  { id: 'p-2', sku: 'BRG-002', barcode: '89912345602', name: 'Minyak Goreng 2L', category: 'Sembako', unit: 'POUCH', costPrice: 31000, sellingPrice: 36000 },
  { id: 'p-3', sku: 'BRG-003', barcode: '89912345603', name: 'Gula Pasir 1kg', category: 'Sembako', unit: 'BKS', costPrice: 14500, sellingPrice: 17500 },
  { id: 'p-4', sku: 'BRG-004', barcode: '89912345604', name: 'Tepung Terigu 1kg', category: 'Bahan Kue', unit: 'BKS', costPrice: 11000, sellingPrice: 13500 },
  { id: 'p-5', sku: 'BRG-005', barcode: '89912345605', name: 'Kopi Bubuk 250g', category: 'Minuman', unit: 'BKS', costPrice: 18000, sellingPrice: 22000 },
];

let MOCK_INVENTORY: Record<string, { t1Stock: number; t2Stock: number; minAlert: number }> = {
  'p-1': { t1Stock: 45, t2Stock: 4, minAlert: 5 },
  'p-2': { t1Stock: 80, t2Stock: 2, minAlert: 10 },
  'p-3': { t1Stock: 60, t2Stock: 12, minAlert: 8 },
  'p-4': { t1Stock: 30, t2Stock: 8, minAlert: 5 },
  'p-5': { t1Stock: 25, t2Stock: 3, minAlert: 5 },
};

let MOCK_TRANSFERS: any[] = [
  {
    id: 'MUT-20261029-01',
    fromOutletId: 'toko-1',
    toOutletId: 'toko-2',
    status: 'REQUESTED',
    notes: 'Stok Toko 2 menipis untuk beras & minyak',
    items: [
      { productId: 'p-1', productName: 'Beras Premium 5kg', qtyRequested: 10, qtyDispatched: 0, qtyReceived: 0 },
      { productId: 'p-2', productName: 'Minyak Goreng 2L', qtyRequested: 15, qtyDispatched: 0, qtyReceived: 0 },
    ],
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

let MOCK_ORDERS: any[] = [];

// 1. Outlets List
app.get('/outlets', (c) => c.json(MOCK_OUTLETS));

// 2. Master Products & Price Search
app.get('/products', (c) => {
  const q = c.req.query('q')?.toLowerCase() || '';
  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
  );
  return c.json(filtered);
});

// 3. Multi-Outlet Stock Monitoring
app.get('/inventory/monitoring', (c) => {
  const result = MOCK_PRODUCTS.map((prod) => {
    const inv = MOCK_INVENTORY[prod.id] || { t1Stock: 0, t2Stock: 0, minAlert: 5 };
    return {
      product: prod,
      toko1Stock: inv.t1Stock,
      toko2Stock: inv.t2Stock,
      minAlertQty: inv.minAlert,
      isToko2Low: inv.t2Stock <= inv.minAlert,
      isToko1Low: inv.t1Stock <= inv.minAlert,
    };
  });
  return c.json(result);
});

// 4. POS Checkout
app.post('/pos/checkout', async (c) => {
  const body = await c.req.json();
  const { outletId, items, paymentMethod, cashReceived } = body;

  let totalAmount = 0;
  const processedItems = items.map((item: any) => {
    const prod = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    const unitPrice = prod?.sellingPrice || item.unitPrice || 0;
    const subtotal = unitPrice * item.qty;
    totalAmount += subtotal;

    // Deduct stock from specific outlet
    const inv = MOCK_INVENTORY[item.productId];
    if (inv) {
      if (outletId === 'toko-1') {
        inv.t1Stock = Math.max(0, inv.t1Stock - item.qty);
      } else {
        inv.t2Stock = Math.max(0, inv.t2Stock - item.qty);
      }
    }

    return {
      productId: item.productId,
      productName: prod?.name || item.productName,
      qty: item.qty,
      unitPrice,
      subtotal,
    };
  });

  const cashChange = cashReceived ? Math.max(0, cashReceived - totalAmount) : 0;
  const order = {
    id: `TRX-${Date.now()}`,
    outletId,
    totalAmount,
    paymentMethod: paymentMethod || 'CASH',
    cashReceived: cashReceived || totalAmount,
    cashChange,
    items: processedItems,
    createdAt: new Date().toISOString(),
  };

  MOCK_ORDERS.unshift(order);
  return c.json({ success: true, order });
});

// 5. Stock Transfers (Request, Dispatch, Receive)
app.get('/transfers', (c) => c.json(MOCK_TRANSFERS));

app.post('/transfers/request', async (c) => {
  const body = await c.req.json();
  const newTransfer = {
    id: `MUT-${Date.now()}`,
    fromOutletId: 'toko-1',
    toOutletId: 'toko-2',
    status: 'REQUESTED',
    notes: body.notes || 'Permintaan stok tambahan',
    items: body.items,
    requestedAt: new Date().toISOString(),
  };
  MOCK_TRANSFERS.unshift(newTransfer);
  return c.json({ success: true, transfer: newTransfer });
});

app.post('/transfers/:id/dispatch', async (c) => {
  const id = c.req.param('id');
  const transfer = MOCK_TRANSFERS.find((t) => t.id === id);
  if (!transfer) return c.json({ error: 'Transfer not found' }, 404);

  transfer.status = 'DISPATCHED';
  transfer.dispatchedAt = new Date().toISOString();

  // Deduct from Toko 1 Gudang
  transfer.items.forEach((item: any) => {
    const inv = MOCK_INVENTORY[item.productId];
    if (inv) {
      inv.t1Stock = Math.max(0, inv.t1Stock - item.qtyRequested);
      item.qtyDispatched = item.qtyRequested;
    }
  });

  return c.json({ success: true, transfer });
});

app.post('/transfers/:id/receive', async (c) => {
  const id = c.req.param('id');
  const transfer = MOCK_TRANSFERS.find((t) => t.id === id);
  if (!transfer) return c.json({ error: 'Transfer not found' }, 404);

  transfer.status = 'RECEIVED';
  transfer.receivedAt = new Date().toISOString();

  // Add to Toko 2 Cabang
  transfer.items.forEach((item: any) => {
    const inv = MOCK_INVENTORY[item.productId];
    if (inv) {
      inv.t2Stock += item.qtyDispatched || item.qtyRequested;
      item.qtyReceived = item.qtyDispatched || item.qtyRequested;
    }
  });

  return c.json({ success: true, transfer });
});

export default app;
