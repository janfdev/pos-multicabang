import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const outletTypeEnum = pgEnum('outlet_type', [
  'STORE_WAREHOUSE', // Toko 1 (Pusat & Gudang)
  'STORE_BRANCH',    // Toko 2 (Cabang)
]);

export const transferStatusEnum = pgEnum('transfer_status', [
  'REQUESTED',       // Diajukan oleh Cabang
  'DISPATCHED',      // Dikirim oleh Pusat/Gudang
  'RECEIVED',        // Diterima & Diverifikasi oleh Cabang
  'CANCELLED',       // Dibatalkan
]);

// 1. OUTLETS
export const outlets = pgTable('outlets', {
  id: text('id').primaryKey(), // e.g. "toko-1", "toko-2"
  name: text('name').notNull(),
  code: text('code').notNull().unique(), // e.g. "T1-PUSAT", "T2-CABANG"
  type: outletTypeEnum('type').notNull().default('STORE_BRANCH'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. MASTER PRODUCTS & PRICES
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode'),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull().default('PCS'),
  costPrice: integer('cost_price').notNull().default(0), // HPP
  sellingPrice: integer('selling_price').notNull().default(0), // Harga Jual
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. INVENTORY PER OUTLET
export const inventory = pgTable(
  'inventory',
  {
    id: text('id').primaryKey(),
    outletId: text('outlet_id')
      .notNull()
      .references(() => outlets.id),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    stockQty: integer('stock_qty').notNull().default(0),
    minAlertQty: integer('min_alert_qty').notNull().default(5),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('outlet_product_unique_idx').on(table.outletId, table.productId),
  ]
);

// 4. POS TRANSACTIONS (ORDERS)
export const orders = pgTable('orders', {
  id: text('id').primaryKey(), // e.g. "TRX-20261029-001"
  outletId: text('outlet_id')
    .notNull()
    .references(() => outlets.id),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('CASH'), // "CASH", "QRIS"
  cashReceived: integer('cash_received'),
  cashChange: integer('cash_change'),
  cashierName: text('cashier_name').notNull().default('Kasir'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  productName: text('product_name').notNull(),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotal: integer('subtotal').notNull(),
});

// 5. STOCK TRANSFERS (MUTASI BARANG)
export const stockTransfers = pgTable('stock_transfers', {
  id: text('id').primaryKey(), // e.g. "MUT-20261029-001"
  fromOutletId: text('from_outlet_id')
    .notNull()
    .references(() => outlets.id),
  toOutletId: text('to_outlet_id')
    .notNull()
    .references(() => outlets.id),
  status: transferStatusEnum('status').notNull().default('REQUESTED'),
  notes: text('notes'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  dispatchedAt: timestamp('dispatched_at'),
  receivedAt: timestamp('received_at'),
});

export const transferItems = pgTable('transfer_items', {
  id: text('id').primaryKey(),
  transferId: text('transfer_id')
    .notNull()
    .references(() => stockTransfers.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  qtyRequested: integer('qty_requested').notNull(),
  qtyDispatched: integer('qty_dispatched').default(0),
  qtyReceived: integer('qty_received').default(0),
});
