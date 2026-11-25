import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DbService } from '../db/service';
import {
  INITIAL_OUTLETS,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_TRANSFERS,
  INITIAL_ORDERS,
  INITIAL_SALES_TREND,
} from './seedData';

export const app = new Hono().basePath('/api');

app.use('*', cors());

// Health Check
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    system: 'POS & Multi-Outlet Inventory API',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    system: 'POS & Multi-Outlet Inventory API',
    timestamp: new Date().toISOString(),
  });
});

const OUTLETS = [...INITIAL_OUTLETS];
let PRODUCTS = INITIAL_PRODUCTS.map((p) => ({ ...p }));
let INVENTORY: Record<string, { t1Stock: number; t2Stock: number; minAlert: number }> = Object.fromEntries(
  Object.entries(INITIAL_INVENTORY).map(([k, v]) => [k, { ...v }])
);
let TRANSFERS: any[] = [...INITIAL_TRANSFERS];
let ORDERS: any[] = [...INITIAL_ORDERS];
const SALES_TREND = [...INITIAL_SALES_TREND];

// 1. Outlets List
app.get('/outlets', (c) => c.json(OUTLETS));

// 2. Master Products & Search
app.get('/products', (c) => {
  const q = c.req.query('q')?.toLowerCase() || '';
  const outletId = c.req.query('outletId') || 'toko-2';
  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      p.category.toLowerCase().includes(q)
  ).map((p) => {
    const inv = INVENTORY[p.id] || { t1Stock: 0, t2Stock: 0, minAlert: 5 };
    const stock = outletId === 'toko-1' ? inv.t1Stock : inv.t2Stock;
    return {
      ...p,
      stock,
      t1Stock: inv.t1Stock,
      t2Stock: inv.t2Stock,
      minAlert: inv.minAlert,
      isLow: stock <= inv.minAlert,
    };
  });
  return c.json(filtered);
});

// 3. Multi-Outlet Stock Monitoring & Alerts
app.get('/inventory/monitoring', (c) => {
  const result = PRODUCTS.map((prod) => {
    const inv = INVENTORY[prod.id] || { t1Stock: 0, t2Stock: 0, minAlert: 5 };
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

// 3.1. Physical Stock Opname & Audit Logging (Proposal F-08, F-09, Aturan Bisnis 11)
interface StockOpnameRecord {
  id: string;
  outletId: string;
  outletName: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  actualStock: number;
  difference: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

let STOCK_OPNAME_LOGS: StockOpnameRecord[] = [
  {
    id: 'OPN-20261025-001',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    productId: 'p-1',
    productName: 'Beras Pandan Wangi 5kg',
    sku: 'BRG-001',
    previousStock: 5,
    actualStock: 4,
    difference: -1,
    reason: '1 Sak beras sobek terkena sudut etalase saat display',
    adjustedBy: 'Kasir Toko 2',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

app.get('/inventory/stock-opname/audit', (c) => {
  const outletId = c.req.query('outletId');
  let result = [...STOCK_OPNAME_LOGS];
  if (outletId && outletId !== 'ALL') {
    result = result.filter((r) => r.outletId === outletId);
  }
  return c.json(result);
});

app.post('/inventory/stock-opname', async (c) => {
  const body = await c.req.json();
  const { outletId, productId, actualStock, reason, adjustedBy } = body;

  const targetOutletId = outletId === 'toko-1' ? 'toko-1' : 'toko-2';
  const currentOutlet = OUTLETS.find((o) => o.id === targetOutletId) || OUTLETS[1];
  const prod = PRODUCTS.find((p) => p.id === productId);

  if (!prod) {
    return c.json({ success: false, error: 'Produk tidak ditemukan' }, 404);
  }

  if (actualStock === undefined || actualStock === null || isNaN(Number(actualStock)) || Number(actualStock) < 0) {
    return c.json({ success: false, error: 'Jumlah stok fisik riil harus berupa angka positif' }, 400);
  }

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return c.json({ success: false, error: 'Alasan penyesuaian wajib diisi untuk jejak audit (Aturan Bisnis 11)' }, 400);
  }

  const parsedActual = Math.floor(Number(actualStock));
  const inv = INVENTORY[prod.id] || { t1Stock: 0, t2Stock: 0, minAlert: 5 };
  const previousStock = targetOutletId === 'toko-1' ? inv.t1Stock : inv.t2Stock;
  const difference = parsedActual - previousStock;

  // Apply atomic adjustment to memory inventory
  if (targetOutletId === 'toko-1') {
    inv.t1Stock = parsedActual;
  } else {
    inv.t2Stock = parsedActual;
  }

  const opnameRecord: StockOpnameRecord = {
    id: `OPN-${Date.now().toString().slice(-6)}`,
    outletId: currentOutlet.id,
    outletName: currentOutlet.name,
    productId: prod.id,
    productName: prod.name,
    sku: prod.sku,
    previousStock,
    actualStock: parsedActual,
    difference,
    reason: reason.trim(),
    adjustedBy: adjustedBy?.trim() || 'Petugas Toko',
    createdAt: new Date().toISOString(),
  };

  STOCK_OPNAME_LOGS.unshift(opnameRecord);

  return c.json({
    success: true,
    message: `Stok "${prod.name}" di ${currentOutlet.name} disesuaikan dari ${previousStock} menjadi ${parsedActual} (Selisih: ${difference >= 0 ? '+' : ''}${difference})`,
    opname: opnameRecord,
  });
});

// 4. POS Checkout
app.post('/pos/checkout', async (c) => {
  const body = await c.req.json();
  const { outletId, items, paymentMethod, cashReceived } = body;

  const targetOutletId = outletId === 'toko-1' ? 'toko-1' : 'toko-2';
  const currentOutlet = OUTLETS.find((o) => o.id === targetOutletId) || OUTLETS[1];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: 'Keranjang belanja kosong' }, 400);
  }

  // 1. Validasi Ketersediaan Stok Sebelum Pengurangan (Anti-Negativity Guard)
  for (const item of items) {
    const inv = INVENTORY[item.productId];
    const available = targetOutletId === 'toko-1' ? (inv?.t1Stock ?? 0) : (inv?.t2Stock ?? 0);
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const prodName = prod?.name || item.name || item.productId;

    if (available < item.qty) {
      return c.json(
        {
          success: false,
          error: `Stok "${prodName}" tidak mencukupi di ${currentOutlet.name}. Tersedia: ${available}, Diminta: ${item.qty}`,
        },
        400
      );
    }
  }

  let totalAmount = 0;

  const processedItems = items.map((item: any) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const unitPrice = prod?.sellingPrice || item.price || item.unitPrice || 0;
    const subtotal = unitPrice * item.qty;
    totalAmount += subtotal;

    // Deduct stock atomik dari outlet terkait
    const inv = INVENTORY[item.productId];
    if (inv) {
      if (targetOutletId === 'toko-1') {
        inv.t1Stock = Math.max(0, inv.t1Stock - item.qty);
      } else {
        inv.t2Stock = Math.max(0, inv.t2Stock - item.qty);
      }
    }

    return {
      productId: item.productId,
      productName: prod?.name || item.name || item.productName,
      qty: item.qty,
      unitPrice,
      subtotal,
    };
  });

  const cashChange = cashReceived ? Math.max(0, cashReceived - totalAmount) : 0;
  const order = {
    id: `TRX-${Date.now().toString().slice(-6)}`,
    outletId: currentOutlet.id,
    outletName: currentOutlet.name,
    totalAmount,
    paymentMethod: paymentMethod || 'CASH',
    cashReceived: cashReceived || totalAmount,
    cashChange,
    items: processedItems,
    createdAt: new Date().toISOString(),
  };

  ORDERS.unshift(order);

  // Persist to Neon DB asynchronously
  DbService.recordOrder({
    id: order.id,
    outletId: order.outletId,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    cashReceived: order.cashReceived,
    cashChange: order.cashChange,
    items: order.items,
  }).catch((err) => console.error('DB async order record error:', err));

  return c.json({ success: true, order });
});

// 4.1. Midtrans Sandbox Digital Payment (QRIS & Webhook with Idempotency)
interface MidtransTx {
  orderId: string;
  outletId: string;
  grossAmount: number;
  items: Array<{ productId: string; productName: string; qty: number; unitPrice: number; subtotal: number }>;
  paymentType: string;
  status: 'pending' | 'settlement' | 'expire' | 'cancel';
  qrString: string;
  cashierName: string;
  createdAt: string;
}

const MIDTRANS_TRANSACTIONS: Record<string, MidtransTx> = {};
const PROCESSED_WEBHOOK_IDS = new Set<string>();

app.post('/pos/midtrans/charge', async (c) => {
  const body = await c.req.json();
  const { outletId, items, cashierName } = body;

  const targetOutletId = outletId === 'toko-1' ? 'toko-1' : 'toko-2';
  const currentOutlet = OUTLETS.find((o) => o.id === targetOutletId) || OUTLETS[1];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: 'Keranjang belanja kosong' }, 400);
  }

  // Pre-validate stock availability (WITHOUT deducting yet!)
  for (const item of items) {
    const inv = INVENTORY[item.productId];
    const available = targetOutletId === 'toko-1' ? (inv?.t1Stock ?? 0) : (inv?.t2Stock ?? 0);
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const prodName = prod?.name || item.name || item.productId;

    if (available < item.qty) {
      return c.json(
        {
          success: false,
          error: `Stok "${prodName}" tidak mencukupi di ${currentOutlet.name}. Tersedia: ${available}, Diminta: ${item.qty}`,
        },
        400
      );
    }
  }

  let grossAmount = 0;
  const processedItems = items.map((item: any) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const unitPrice = prod?.sellingPrice || item.price || item.unitPrice || 0;
    const subtotal = unitPrice * item.qty;
    grossAmount += subtotal;

    return {
      productId: item.productId,
      productName: prod?.name || item.name || item.productName || item.productId,
      qty: item.qty,
      unitPrice,
      subtotal,
    };
  });

  const orderId = `TRX-${Date.now().toString().slice(-6)}`;
  const qrString = `00020101021226580016ID.CO.MIDTRANS.WWW01189360091800000000005204541153033605802ID5914POS MULTICABANG6007CIREBON62070703A016304${orderId.slice(-4)}`;

  const tx: MidtransTx = {
    orderId,
    outletId: currentOutlet.id,
    grossAmount,
    items: processedItems,
    paymentType: 'qris',
    status: 'pending',
    qrString,
    cashierName: cashierName || 'Kasir',
    createdAt: new Date().toISOString(),
  };

  MIDTRANS_TRANSACTIONS[orderId] = tx;

  return c.json({
    success: true,
    orderId,
    grossAmount,
    paymentType: 'qris',
    transactionStatus: 'pending',
    qrString,
    outletName: currentOutlet.name,
    environment: 'sandbox',
  });
});

app.post('/pos/midtrans/webhook', async (c) => {
  const body = await c.req.json();
  const orderId = body.order_id || body.orderId;
  const transactionStatus = (body.transaction_status || body.transactionStatus || '').toLowerCase();

  if (!orderId) {
    return c.json({ success: false, error: 'order_id wajib disertakan' }, 400);
  }

  // Idempotency Guard: prevent duplicate stock deductions
  if (PROCESSED_WEBHOOK_IDS.has(orderId)) {
    return c.json({
      success: true,
      alreadyProcessed: true,
      message: 'Notifikasi webhook telah diproses sebelumnya (Idempotency Active)',
    });
  }

  const tx = MIDTRANS_TRANSACTIONS[orderId];
  if (!tx) {
    return c.json({ success: false, error: 'Transaksi tidak ditemukan' }, 404);
  }

  if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
    // Deduct stock atomik TEPAT SATU KALI
    const targetOutletId = tx.outletId;
    for (const item of tx.items) {
      const inv = INVENTORY[item.productId];
      if (inv) {
        if (targetOutletId === 'toko-1') {
          inv.t1Stock = Math.max(0, inv.t1Stock - item.qty);
        } else {
          inv.t2Stock = Math.max(0, inv.t2Stock - item.qty);
        }
      }
    }

    const currentOutlet = OUTLETS.find((o) => o.id === targetOutletId) || OUTLETS[1];
    const order = {
      id: tx.orderId,
      outletId: tx.outletId,
      outletName: currentOutlet.name,
      totalAmount: tx.grossAmount,
      paymentMethod: 'QRIS_MIDTRANS',
      cashReceived: tx.grossAmount,
      cashChange: 0,
      cashierName: tx.cashierName,
      items: tx.items,
      createdAt: new Date().toISOString(),
    };

    ORDERS.unshift(order);
    PROCESSED_WEBHOOK_IDS.add(orderId);
    tx.status = 'settlement';

    // Persist to Neon DB asynchronously
    DbService.recordOrder({
      id: order.id,
      outletId: order.outletId,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      cashReceived: order.cashReceived,
      cashChange: order.cashChange,
      items: order.items,
    }).catch((err) => console.error('DB async order record error:', err));

    return c.json({ success: true, status: 'SETTLED', order });
  }

  if (transactionStatus === 'expire' || transactionStatus === 'cancel' || transactionStatus === 'deny') {
    tx.status = 'expire';
    return c.json({ success: true, status: 'EXPIRED', message: 'Transaksi kedaluwarsa atau dibatalkan. Stok aman.' });
  }

  return c.json({ success: true, status: tx.status });
});

app.get('/pos/midtrans/status/:orderId', (c) => {
  const orderId = c.req.param('orderId');
  const tx = MIDTRANS_TRANSACTIONS[orderId];
  if (!tx) return c.json({ error: 'Transaksi tidak ditemukan' }, 404);
  return c.json({ orderId, status: tx.status, grossAmount: tx.grossAmount });
});

// 5. Stock Transfers (Request, Dispatch, Receive)
app.get('/transfers', (c) => c.json(TRANSFERS));

app.post('/transfers/request', async (c) => {
  const body = await c.req.json();
  const rawItems = Array.isArray(body.items) ? body.items : [body];
  if (rawItems.length === 0) {
    return c.json({ success: false, error: 'Daftar item mutasi tidak boleh kosong' }, 400);
  }

  const items = rawItems.map((item: any) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      productName: prod?.name || item.productName || item.productId,
      qtyRequested: Math.max(1, Number(item.qtyRequested) || 1),
      qtyDispatched: 0,
      qtyReceived: 0,
    };
  });

  const fromOutletId = body.fromOutletId || 'toko-1';
  const toOutletId = body.toOutletId || (fromOutletId === 'toko-1' ? 'toko-2' : 'toko-1');
  const type = body.type || (fromOutletId === 'toko-1' ? 'RESTOCK' : 'RETURN');

  const newTransfer = {
    id: `MUT-${Date.now().toString().slice(-6)}`,
    fromOutletId,
    toOutletId,
    type,
    status: 'REQUESTED',
    courierName: body.courierName || null,
    dispatchedBy: null,
    receivedBy: null,
    notes: body.notes || (type === 'RESTOCK' ? 'Permintaan stok tambahan' : 'Retur / Relokasi stok cabang'),
    items,
    requestedAt: new Date().toISOString(),
  };

  TRANSFERS.unshift(newTransfer);

  // Persist to Neon DB asynchronously
  DbService.recordStockTransfer({
    id: newTransfer.id,
    fromOutletId: newTransfer.fromOutletId,
    toOutletId: newTransfer.toOutletId,
    type: newTransfer.type,
    notes: newTransfer.notes,
    items: newTransfer.items.map((i: any) => ({
      productId: i.productId,
      qtyRequested: i.qtyRequested,
    })),
  }).catch((err) => console.error('DB async transfer record error:', err));

  return c.json({ success: true, transfer: newTransfer });
});

app.post('/transfers/:id/dispatch', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const transfer = TRANSFERS.find((t) => t.id === id);
  if (!transfer) return c.json({ error: 'Transfer not found' }, 404);

  // Deduct from source outlet (fromOutletId)
  transfer.items.forEach((item: any) => {
    const inv = INVENTORY[item.productId];
    if (inv) {
      if (transfer.fromOutletId === 'toko-1') {
        const dispatchQty = Math.min(inv.t1Stock, item.qtyRequested);
        inv.t1Stock = Math.max(0, inv.t1Stock - dispatchQty);
        item.qtyDispatched = dispatchQty;
      } else {
        const dispatchQty = Math.min(inv.t2Stock, item.qtyRequested);
        inv.t2Stock = Math.max(0, inv.t2Stock - dispatchQty);
        item.qtyDispatched = dispatchQty;
      }
    }
  });

  transfer.status = 'DISPATCHED';
  if (body.courierName) transfer.courierName = body.courierName;
  transfer.dispatchedBy = body.dispatchedBy || (transfer.fromOutletId === 'toko-1' ? 'Gudang Pusat Toko 1' : 'Staf Toko 2');
  transfer.dispatchedAt = new Date().toISOString();

  return c.json({ success: true, transfer });
});

app.post('/transfers/:id/receive', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const transfer = TRANSFERS.find((t) => t.id === id);
  if (!transfer) return c.json({ error: 'Transfer not found' }, 404);

  // Add to destination outlet (toOutletId)
  transfer.items.forEach((item: any) => {
    const inv = INVENTORY[item.productId];
    if (inv) {
      const receiveQty = item.qtyDispatched ?? item.qtyRequested;
      if (transfer.toOutletId === 'toko-1') {
        inv.t1Stock += receiveQty;
      } else {
        inv.t2Stock += receiveQty;
      }
      item.qtyReceived = receiveQty;
    }
  });

  transfer.status = 'RECEIVED';
  transfer.receivedBy = body.receivedBy || (transfer.toOutletId === 'toko-1' ? 'Kepala Gudang Toko 1' : 'Staf Toko 2');
  transfer.receivedAt = new Date().toISOString();

  return c.json({ success: true, transfer });
});

// 6. Online Customer Orders (Model B - Public Web Store)
let ONLINE_ORDERS: any[] = [
  {
    id: 'ONL-20261119-001',
    outletId: 'toko-1',
    customerName: 'Aisyah Putri',
    customerPhone: '081234567890',
    fulfillmentType: 'DELIVERY',
    deliveryAddress: 'Jl. Pemuda No. 88, Cirebon',
    status: 'PENDING',
    totalAmount: 112500,
    notes: 'Mohon diantar sebelum sore',
    items: [
      { productId: 'p-1', productName: 'Beras Pandan Wangi 5kg', qty: 1, unitPrice: 76000, subtotal: 76000 },
      { productId: 'p-2', productName: 'Minyak Goreng Sawit 2L', qty: 1, unitPrice: 36500, subtotal: 36500 },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ONL-20261119-002',
    outletId: 'toko-2',
    customerName: 'Hendra Gunawan',
    customerPhone: '081988776655',
    fulfillmentType: 'PICKUP',
    deliveryAddress: null,
    status: 'PROCESSING',
    totalAmount: 34000,
    notes: 'Akan diambil setelah jam kantor',
    items: [
      { productId: 'p-3', productName: 'Gula Pasir Kristal 1kg', qty: 1, unitPrice: 17500, subtotal: 17500 },
      { productId: 'p-5', productName: 'Kopi Kapal Api Spesial 165g', qty: 1, unitPrice: 16500, subtotal: 16500 },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('62')) return `0${digits.slice(2)}`;
  return digits;
};

app.get('/online-orders', (c) => {
  const outletId = c.req.query('outletId');
  const status = c.req.query('status');
  const phone = c.req.query('phone');

  let results = [...ONLINE_ORDERS];
  if (outletId && outletId !== 'ALL') {
    results = results.filter((o) => o.outletId === outletId);
  }
  if (status && status !== 'ALL') {
    results = results.filter((o) => o.status === status);
  }
  if (phone && phone.trim()) {
    const queryNorm = normalizePhone(phone.trim());
    results = results.filter((o) => {
      const orderNorm = normalizePhone(o.customerPhone || '');
      return queryNorm.length > 0 && (orderNorm.includes(queryNorm) || queryNorm.includes(orderNorm));
    });
  }
  return c.json(results);
});

app.get('/online-orders/:id/reorder', (c) => {
  const id = c.req.param('id');
  const order = ONLINE_ORDERS.find((o) => o.id === id);
  if (!order) {
    return c.json({ success: false, error: 'Pesanan tidak ditemukan' }, 404);
  }

  const targetOutlet = OUTLETS.find((o) => o.id === order.outletId) || OUTLETS[0];
  const warnings: string[] = [];

  const validatedItems = (order.items || []).map((item: any) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const inv = INVENTORY[item.productId];
    const availableQty = order.outletId === 'toko-1' ? (inv?.t1Stock ?? 0) : (inv?.t2Stock ?? 0);
    const currentUnitPrice = prod?.sellingPrice ?? item.unitPrice ?? 0;
    const priceChanged = currentUnitPrice !== item.unitPrice;
    const outOfStock = availableQty <= 0;
    const adjustedQty = Math.min(item.qty, availableQty);

    if (outOfStock) {
      warnings.push(`Stok "${item.productName}" sedang habis di ${targetOutlet.name}.`);
    } else if (adjustedQty < item.qty) {
      warnings.push(`Stok "${item.productName}" hanya tersisa ${availableQty} (diminta ${item.qty}).`);
    }
    if (priceChanged && !outOfStock) {
      warnings.push(`Harga "${item.productName}" diperbarui menjadi Rp ${currentUnitPrice.toLocaleString('id-ID')}.`);
    }

    return {
      productId: item.productId,
      productName: prod?.name || item.productName,
      requestedQty: item.qty,
      availableQty,
      adjustedQty,
      previousUnitPrice: item.unitPrice,
      currentUnitPrice,
      priceChanged,
      outOfStock,
      unit: prod?.unit || 'PCS',
      image: prod?.image || '',
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
    };
  });

  return c.json({
    success: true,
    orderId: order.id,
    outletId: targetOutlet.id,
    outletName: targetOutlet.name,
    items: validatedItems,
    warnings,
  });
});

app.post('/online-orders', async (c) => {
  const body = await c.req.json();
  const outletId = body.outletId || 'toko-1';
  const targetOutlet = OUTLETS.find((o) => o.id === outletId);
  if (!targetOutlet) {
    return c.json({ success: false, error: 'Outlet tidak valid' }, 400);
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return c.json({ success: false, error: 'Keranjang belanja tidak boleh kosong' }, 400);
  }

  // Pre-validate stock availability at selected outlet
  for (const item of rawItems) {
    const inv = INVENTORY[item.productId];
    const available = outletId === 'toko-1' ? (inv?.t1Stock ?? 0) : (inv?.t2Stock ?? 0);
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const prodName = prod?.name || item.name || item.productId;

    if (available < item.qty) {
      return c.json(
        {
          success: false,
          error: `Stok "${prodName}" tidak mencukupi di ${targetOutlet.name}. Tersedia: ${available}, Diminta: ${item.qty}`,
        },
        400
      );
    }
  }

  let subtotalAmount = 0;
  const processedItems = rawItems.map((item: any) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    const unitPrice = prod?.sellingPrice || item.unitPrice || 0;
    const itemSubtotal = unitPrice * item.qty;
    subtotalAmount += itemSubtotal;

    return {
      productId: item.productId,
      productName: prod?.name || item.productName || item.productId,
      qty: item.qty,
      unitPrice,
      subtotal: itemSubtotal,
    };
  });

  const fulfillmentType = body.fulfillmentType || 'PICKUP';

  // Proposal Rules: F-16 & F-17 (Minimum Belanja Rp30.000 & Ongkir Rp5.000 / Gratis)
  if (fulfillmentType === 'DELIVERY') {
    if (subtotalAmount < 30000) {
      return c.json(
        {
          success: false,
          error: 'Layanan delivery memerlukan subtotal belanja minimal Rp30.000. Silakan tambah item atau pilih opsi Ambil di Toko (Pickup).',
        },
        400
      );
    }
  }

  const deliveryFee = fulfillmentType === 'DELIVERY' ? (subtotalAmount < 50000 ? 5000 : 0) : 0;
  const totalAmount = subtotalAmount + deliveryFee;

  const newOrder = {
    id: `ONL-${Date.now().toString().slice(-6)}`,
    outletId,
    customerName: body.customerName || 'Pelanggan Online',
    customerPhone: body.customerPhone || '-',
    fulfillmentType,
    deliveryAddress: body.deliveryAddress || null,
    status: 'PENDING',
    subtotal: subtotalAmount,
    deliveryFee,
    totalAmount,
    notes: body.notes || '',
    items: processedItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ONLINE_ORDERS.unshift(newOrder);

  // Persist to Neon DB asynchronously
  DbService.recordOnlineOrder({
    id: newOrder.id,
    outletId: newOrder.outletId,
    customerName: newOrder.customerName,
    customerPhone: newOrder.customerPhone,
    fulfillmentType: newOrder.fulfillmentType,
    deliveryAddress: newOrder.deliveryAddress || undefined,
    totalAmount: newOrder.totalAmount,
    notes: newOrder.notes,
    items: newOrder.items,
  }).catch((err) => console.error('DB async online order record error:', err));

  return c.json({ success: true, order: newOrder });
});

app.patch('/online-orders/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const newStatus = body.status;

  const order = ONLINE_ORDERS.find((o) => o.id === id);
  if (!order) {
    return c.json({ success: false, error: 'Pesanan online tidak ditemukan' }, 404);
  }

  const previousStatus = order.status;

  // If moving from PENDING to PROCESSING -> deduct stock
  if (previousStatus === 'PENDING' && (newStatus === 'PROCESSING' || newStatus === 'READY' || newStatus === 'COMPLETED')) {
    // Check and deduct stock
    for (const item of order.items) {
      const inv = INVENTORY[item.productId];
      if (inv) {
        if (order.outletId === 'toko-1') {
          inv.t1Stock = Math.max(0, inv.t1Stock - item.qty);
        } else {
          inv.t2Stock = Math.max(0, inv.t2Stock - item.qty);
        }
      }
    }
  }

  // If order was already PROCESSING or READY and is now CANCELLED -> rollback stock
  if ((previousStatus === 'PROCESSING' || previousStatus === 'READY') && newStatus === 'CANCELLED') {
    for (const item of order.items) {
      const inv = INVENTORY[item.productId];
      if (inv) {
        if (order.outletId === 'toko-1') {
          inv.t1Stock += item.qty;
        } else {
          inv.t2Stock += item.qty;
        }
      }
    }
  }

  order.status = newStatus;
  order.updatedAt = new Date().toISOString();

  return c.json({ success: true, order });
});

// 7. Analytics & Performance Dashboard
app.get('/analytics/dashboard', (c) => {
  // Base Inventory Calculations
  const totalToko1Stock = Object.values(INVENTORY).reduce((acc, curr) => acc + curr.t1Stock, 0);
  const totalToko2Stock = Object.values(INVENTORY).reduce((acc, curr) => acc + curr.t2Stock, 0);
  const lowStockToko2Count = Object.values(INVENTORY).filter((curr) => curr.t2Stock <= curr.minAlert).length;
  const lowStockToko1Count = Object.values(INVENTORY).filter((curr) => curr.t1Stock <= curr.minAlert).length;

  // Stock Valuation Calculation (Based on Cost & Selling Price)
  const toko1Valuation = PRODUCTS.reduce((acc, p) => {
    const inv = INVENTORY[p.id]?.t1Stock || 0;
    return acc + inv * p.costPrice;
  }, 0);

  const toko2Valuation = PRODUCTS.reduce((acc, p) => {
    const inv = INVENTORY[p.id]?.t2Stock || 0;
    return acc + inv * p.costPrice;
  }, 0);

  // Transfer Metrics
  const pendingTransfersCount = TRANSFERS.filter((t) => t.status === 'REQUESTED').length;
  const inTransitTransfersCount = TRANSFERS.filter((t) => t.status === 'DISPATCHED').length;
  const pendingOnlineOrdersCount = ONLINE_ORDERS.filter((o) => o.status === 'PENDING').length;

  // Segmented Orders & Revenues
  const toko1PosOrders = ORDERS.filter((o) => o.outletId === 'toko-1');
  const toko2PosOrders = ORDERS.filter((o) => o.outletId === 'toko-2');
  const toko1OnlineOrders = ONLINE_ORDERS.filter((o) => o.outletId === 'toko-1' && o.status !== 'CANCELLED');
  const toko2OnlineOrders = ONLINE_ORDERS.filter((o) => o.outletId === 'toko-2' && o.status !== 'CANCELLED');

  const toko1PosRevenue = toko1PosOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const toko2PosRevenue = toko2PosOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const toko1OnlineRevenue = toko1OnlineOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const toko2OnlineRevenue = toko2OnlineOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const toko1TotalRevenue = toko1PosRevenue + toko1OnlineRevenue;
  const toko2TotalRevenue = toko2PosRevenue + toko2OnlineRevenue;

  const posRevenue = ORDERS.reduce((acc, o) => acc + o.totalAmount, 0);
  const onlineRevenue = ONLINE_ORDERS.filter((o) => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.totalAmount, 0);
  const todayRevenue = posRevenue + onlineRevenue;

  // Cache-Control for High Speed & Cold Start Mitigation
  c.header('Cache-Control', 's-maxage=5, stale-while-revalidate=30');

  return c.json({
    kpis: {
      totalProducts: PRODUCTS.length,
      totalToko1Stock,
      totalToko2Stock,
      lowStockToko2Count,
      lowStockToko1Count,
      pendingTransfersCount,
      inTransitTransfersCount,
      pendingOnlineOrdersCount,
      totalOrdersToday: ORDERS.length + ONLINE_ORDERS.length,
      posOrdersToday: ORDERS.length,
      onlineOrdersToday: ONLINE_ORDERS.length,
      posRevenue,
      onlineRevenue,
      todayRevenue,
      // Store Specific Breakdown
      toko1: {
        name: 'Toko 1 (Pusat & Gudang)',
        totalStock: totalToko1Stock,
        stockValuation: toko1Valuation,
        posRevenue: toko1PosRevenue,
        onlineRevenue: toko1OnlineRevenue,
        totalRevenue: toko1TotalRevenue,
        ordersCount: toko1PosOrders.length + toko1OnlineOrders.length,
        pendingDispatchToToko2: TRANSFERS.filter((t) => t.fromOutletId === 'toko-1' && t.status === 'REQUESTED').length,
        inboundReturns: TRANSFERS.filter((t) => t.toOutletId === 'toko-1' && t.status === 'DISPATCHED').length,
      },
      toko2: {
        name: 'Toko 2 (Cabang Satelit)',
        totalStock: totalToko2Stock,
        stockValuation: toko2Valuation,
        posRevenue: toko2PosRevenue,
        onlineRevenue: toko2OnlineRevenue,
        totalRevenue: toko2TotalRevenue,
        ordersCount: toko2PosOrders.length + toko2OnlineOrders.length,
        criticalStockCount: lowStockToko2Count,
        inTransitFromPusat: TRANSFERS.filter((t) => t.toOutletId === 'toko-2' && t.status === 'DISPATCHED').length,
        pendingRestockRequests: TRANSFERS.filter((t) => t.toOutletId === 'toko-2' && t.status === 'REQUESTED').length,
      },
    },
    salesTrend: SALES_TREND,
    recentOrders: ORDERS.slice(0, 5),
    recentOnlineOrders: ONLINE_ORDERS.slice(0, 5),
    toko1RecentOrders: toko1PosOrders.slice(0, 5),
    toko2RecentOrders: toko2PosOrders.slice(0, 5),
  });
});

// 8. Financial Report & Profit/Loss Analysis
app.get('/reports/financial', (c) => {
  const outletId = c.req.query('outletId') || 'ALL';

  const filteredOrders = outletId === 'ALL'
    ? ORDERS
    : ORDERS.filter((o) => o.outletId === outletId);

  const filteredOnline = outletId === 'ALL'
    ? ONLINE_ORDERS.filter((o) => o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'PROCESSING')
    : ONLINE_ORDERS.filter((o) => o.outletId === outletId && (o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'PROCESSING'));

  let grossRevenue = 0;
  let totalCost = 0;
  let totalItemsSold = 0;
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};

  filteredOrders.forEach((o) => {
    grossRevenue += o.totalAmount;
    o.items?.forEach((it: any) => {
      totalItemsSold += it.qty;
      const prod = PRODUCTS.find((p) => p.id === it.productId);
      const cost = (prod?.costPrice || 0) * it.qty;
      totalCost += cost;

      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = {
          name: it.productName || prod?.name || it.productId,
          qty: 0,
          revenue: 0,
          cost: 0,
        };
      }
      productSalesMap[it.productId].qty += it.qty;
      productSalesMap[it.productId].revenue += it.subtotal;
      productSalesMap[it.productId].cost += cost;
    });
  });

  filteredOnline.forEach((o) => {
    grossRevenue += o.totalAmount;
    o.items?.forEach((it: any) => {
      totalItemsSold += it.qty;
      const prod = PRODUCTS.find((p) => p.id === it.productId);
      const cost = (prod?.costPrice || 0) * it.qty;
      totalCost += cost;

      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = {
          name: it.productName || prod?.name || it.productId,
          qty: 0,
          revenue: 0,
          cost: 0,
        };
      }
      productSalesMap[it.productId].qty += it.qty;
      productSalesMap[it.productId].revenue += it.subtotal;
      productSalesMap[it.productId].cost += cost;
    });
  });

  const grossProfit = grossRevenue - totalCost;
  const grossMarginPct = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : '0';

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      profit: p.revenue - p.cost,
      margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue * 100).toFixed(1) : '0',
    }));

  return c.json({
    outletId,
    grossRevenue,
    totalCost,
    grossProfit,
    grossMarginPct: Number(grossMarginPct),
    totalTransactions: filteredOrders.length + filteredOnline.length,
    totalItemsSold,
    topProducts,
    allOrders: filteredOrders,
  });
});

// Helper testing state accessors
export const _testing = {
  getInventory: () => INVENTORY,
  getProducts: () => PRODUCTS,
  getOrders: () => ORDERS,
  getOnlineOrders: () => ONLINE_ORDERS,
  getTransfers: () => TRANSFERS,
  setStock: (productId: string, t1: number, t2: number) => {
    if (INVENTORY[productId]) {
      INVENTORY[productId].t1Stock = t1;
      INVENTORY[productId].t2Stock = t2;
    }
  },
};

export default app;
