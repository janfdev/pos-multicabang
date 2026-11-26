import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'OWNER',           // Pemilik / Super Admin
  'WAREHOUSE',       // Petugas Gudang Toko 1
  'CASHIER',         // Kasir Toko 1 / Toko 2
  'BRANCH_STAFF',    // Petugas Gerai Toko 2
]);

export const outletTypeEnum = pgEnum('outlet_type', [
  'STORE_WAREHOUSE', // Toko 1 (Pusat & Gudang)
  'STORE_BRANCH',    // Toko 2 (Cabang)
]);

export const transferStatusEnum = pgEnum('transfer_status', [
  'REQUESTED',       // Diajukan oleh Cabang/Pusat
  'DISPATCHED',      // Dikirim oleh Asal (In-Transit)
  'RECEIVED',        // Diterima & Diverifikasi oleh Tujuan
  'CANCELLED',       // Dibatalkan
]);

export const transferTypeEnum = pgEnum('transfer_type', [
  'RESTOCK',         // Toko 1 -> Toko 2 (Pasokan)
  'RETURN',          // Toko 2 -> Toko 1 (Retur Barang Rusak/Kadaluarsa)
  'REBALANCE',       // Toko 2 -> Toko 1 (Relokasi Kelebihan Stok)
]);

export const onlineOrderStatusEnum = pgEnum('online_order_status', [
  'PENDING',         // Menunggu konfirmasi pembayaran / verifikasi
  'PROCESSING',      // Sedang diproses / packing (stok cabang terpotong atomik)
  'READY',           // Siap diambil pelanggan / kurir
  'COMPLETED',       // Transaksi selesai
  'CANCELLED',       // Dibatalkan (stok di-rollback jika sudah processing)
]);

export const fulfillmentTypeEnum = pgEnum('fulfillment_type', [
  'PICKUP',          // Ambil di toko sendiri
  'DELIVERY',        // Dikirim kurir ke alamat
]);

export const orderStatusEnum = pgEnum('order_status', [
  'COMPLETED',       // Transaksi POS selesai
  'VOIDED',          // Transaksi dibatalkan / diretur (Proposal F-13)
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
  status: orderStatusEnum('status').notNull().default('COMPLETED'),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('CASH'), // "CASH", "QRIS_MIDTRANS"
  cashReceived: integer('cash_received'),
  cashChange: integer('cash_change'),
  cashierName: text('cashier_name').notNull().default('Kasir'),
  voidReason: text('void_reason'),
  voidedBy: text('voided_by'),
  voidedAt: timestamp('voided_at'),
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

// 5. STOCK TRANSFERS (MUTASI BARANG DUA ARAH)
export const stockTransfers = pgTable('stock_transfers', {
  id: text('id').primaryKey(), // e.g. "MUT-20261029-001"
  fromOutletId: text('from_outlet_id')
    .notNull()
    .references(() => outlets.id),
  toOutletId: text('to_outlet_id')
    .notNull()
    .references(() => outlets.id),
  type: transferTypeEnum('type').notNull().default('RESTOCK'),
  status: transferStatusEnum('status').notNull().default('REQUESTED'),
  courierName: text('courier_name'),
  dispatchedBy: text('dispatched_by'),
  receivedBy: text('received_by'),
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

// 6. ONLINE ORDERS & ITEMS (MODEL B - PUBLIC STORE)
export const onlineOrders = pgTable('online_orders', {
  id: text('id').primaryKey(), // e.g. "ONL-20261119-001"
  outletId: text('outlet_id')
    .notNull()
    .references(() => outlets.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  fulfillmentType: fulfillmentTypeEnum('fulfillment_type').notNull().default('PICKUP'),
  deliveryAddress: text('delivery_address'),
  status: onlineOrderStatusEnum('status').notNull().default('PENDING'),
  subtotal: integer('subtotal').notNull().default(0),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const onlineOrderItems = pgTable('online_order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => onlineOrders.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  productName: text('product_name').notNull(),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotal: integer('subtotal').notNull(),
});

// 7. USERS & RBAC ACCOUNTS (PROPOSAL F-01 & F-02)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // e.g. "usr-owner", "usr-kasir-t1"
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('CASHIER'),
  roleLabel: text('role_label').notNull(),
  outletId: text('outlet_id').references(() => outlets.id), // null for OWNER (ALL outlets)
  outletName: text('outlet_name').notNull(),
  avatar: text('avatar'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. STOCK OPNAME AUDIT LOGS (PROPOSAL F-08 & F-09)
export const stockOpnameLogs = pgTable('stock_opname_logs', {
  id: text('id').primaryKey(), // e.g. "OPN-123456"
  outletId: text('outlet_id')
    .notNull()
    .references(() => outlets.id),
  outletName: text('outlet_name').notNull(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  productName: text('product_name').notNull(),
  sku: text('sku').notNull(),
  previousStock: integer('previous_stock').notNull(),
  actualStock: integer('actual_stock').notNull(),
  difference: integer('difference').notNull(),
  reason: text('reason').notNull(),
  adjustedBy: text('adjusted_by').notNull().default('Petugas Toko'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
