import { scryptSync, timingSafeEqual } from 'node:crypto';
import { db, queryClient } from './client.js';
import { outlets, products, inventory, users } from './schema.js';

const PASSWORD_SALT = 'pos-multicabang-umc-2026';

export function hashPassword(plain: string): string {
  return scryptSync(plain, PASSWORD_SALT, 32).toString('hex');
}

export function verifyPassword(plain: string, hash: string): boolean {
  const derived = scryptSync(plain, PASSWORD_SALT, 32);
  const expected = Buffer.from(hash, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export const SEED_USERS = [
  {
    id: 'usr-owner',
    name: 'H. Budi Santoso',
    email: 'owner@pos.id',
    passwordHash: hashPassword('password123'),
    role: 'OWNER' as const,
    roleLabel: 'Pemilik / Super Admin (Lintas Gerai)',
    outletId: null,
    outletName: 'Semua Cabang (Konsolidasi)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    isActive: true,
  },
  {
    id: 'usr-gudang-t1',
    name: 'Rian Kurniawan',
    email: 'gudang@pos.id',
    passwordHash: hashPassword('password123'),
    role: 'WAREHOUSE' as const,
    roleLabel: 'Petugas Gudang Toko 1 (Pusat & Pasokan)',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    isActive: true,
  },
  {
    id: 'usr-kasir-t1',
    name: 'Fajar Ramadhan',
    email: 'kasir1@pos.id',
    passwordHash: hashPassword('password123'),
    role: 'CASHIER' as const,
    roleLabel: 'Kasir POS Toko 1 (Pusat)',
    outletId: 'toko-1',
    outletName: 'Toko 1 (Pusat & Gudang)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    isActive: true,
  },
  {
    id: 'usr-kasir-t2',
    name: 'Dewi Lestari',
    email: 'kasir2@pos.id',
    passwordHash: hashPassword('password123'),
    role: 'CASHIER' as const,
    roleLabel: 'Kasir POS Toko 2 (Cabang Satelit)',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    isActive: true,
  },
  {
    id: 'usr-staf-t2',
    name: 'Agus Setiawan',
    email: 'staf2@pos.id',
    passwordHash: hashPassword('password123'),
    role: 'BRANCH_STAFF' as const,
    roleLabel: 'Petugas Gerai Toko 2 (Cabang)',
    outletId: 'toko-2',
    outletName: 'Toko 2 (Cabang Satelit)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces',
    isActive: true,
  },
];

export async function seedDatabase() {
  console.log('--- Starting Neon PostgreSQL Database Seed ---');

  // 0. Ensure audit & void schema extensions exist safely (idempotent DDL)
  if (queryClient) {
    await queryClient`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('COMPLETED', 'VOIDED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;
    await queryClient`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS status order_status NOT NULL DEFAULT 'COMPLETED',
        ADD COLUMN IF NOT EXISTS void_reason text,
        ADD COLUMN IF NOT EXISTS voided_by text,
        ADD COLUMN IF NOT EXISTS voided_at timestamp;
    `;
    await queryClient`
      ALTER TABLE online_orders
        ADD COLUMN IF NOT EXISTS subtotal integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS delivery_fee integer NOT NULL DEFAULT 0;
    `;
    await queryClient`
      CREATE TABLE IF NOT EXISTS stock_opname_logs (
        id text PRIMARY KEY,
        outlet_id text NOT NULL REFERENCES outlets(id),
        outlet_name text NOT NULL,
        product_id text NOT NULL REFERENCES products(id),
        product_name text NOT NULL,
        sku text NOT NULL,
        previous_stock integer NOT NULL,
        actual_stock integer NOT NULL,
        difference integer NOT NULL,
        reason text NOT NULL,
        adjusted_by text NOT NULL DEFAULT 'Petugas Toko',
        created_at timestamp NOT NULL DEFAULT now()
      );
    `;
  }

  // 1. Seed Outlets (Idempotent)
  await db
    .insert(outlets)
    .values([
      {
        id: 'toko-1',
        name: 'Toko 1 (Pusat & Gudang)',
        code: 'T1-PUSAT',
        type: 'STORE_WAREHOUSE',
        address: 'Jl. Pemuda No. 12, Cirebon',
      },
      {
        id: 'toko-2',
        name: 'Toko 2 (Cabang Satelit)',
        code: 'T2-CABANG',
        type: 'STORE_BRANCH',
        address: 'Jl. Kesambi No. 45, Cirebon',
      },
    ])
    .onConflictDoNothing();

  // 2. Seed Users (5 Proposal RBAC Actors with hashed passwords)
  await db.insert(users).values(SEED_USERS).onConflictDoNothing();

  // 3. Seed Master Products (Idempotent)
  await db
    .insert(products)
    .values([
      { id: 'p-1', sku: 'BRG-001', barcode: '89912345601', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', unit: 'SAK', costPrice: 65000, sellingPrice: 76000 },
      { id: 'p-2', sku: 'BRG-002', barcode: '89912345602', name: 'Minyak Goreng Sawit 2L', category: 'Sembako', unit: 'POUCH', costPrice: 31000, sellingPrice: 36500 },
      { id: 'p-3', sku: 'BRG-003', barcode: '89912345603', name: 'Gula Pasir Kristal 1kg', category: 'Sembako', unit: 'BKS', costPrice: 15000, sellingPrice: 17500 },
      { id: 'p-4', sku: 'BRG-004', barcode: '89912345604', name: 'Tepung Terigu Segitiga 1kg', category: 'Bahan Kue', unit: 'BKS', costPrice: 11500, sellingPrice: 13500 },
      { id: 'p-5', sku: 'BRG-005', barcode: '89912345605', name: 'Kopi Kapal Api Spesial 165g', category: 'Minuman', unit: 'BKS', costPrice: 14000, sellingPrice: 16500 },
      { id: 'p-6', sku: 'BRG-006', barcode: '89912345606', name: 'Susu Kental Manis Putih 370g', category: 'Minuman', unit: 'KALENG', costPrice: 11000, sellingPrice: 13000 },
      { id: 'p-7', sku: 'BRG-007', barcode: '89912345607', name: 'Mie Instan Goreng Spesial', category: 'Makanan Cepat', unit: 'DUS', costPrice: 108000, sellingPrice: 122000 },
      { id: 'p-8', sku: 'BRG-008', barcode: '89912345608', name: 'Kecap Manis Botol 600ml', category: 'Bumbu Dapur', unit: 'BOTOL', costPrice: 20000, sellingPrice: 24000 },
      { id: 'p-9', sku: 'BRG-009', barcode: '89912345609', name: 'Sabun Cuci Piring Jeruk Nipis 780ml', category: 'Kebersihan', unit: 'POUCH', costPrice: 13500, sellingPrice: 16000 },
      { id: 'p-10', sku: 'BRG-010', barcode: '89912345610', name: 'Deterjen Bubuk Konsentrat 800g', category: 'Kebersihan', unit: 'BKS', costPrice: 17500, sellingPrice: 21000 },
      { id: 'p-11', sku: 'BRG-011', barcode: '89912345611', name: 'Telur Ayam Ras 1 Tray (30 butir)', category: 'Sembako', unit: 'TRAY', costPrice: 48000, sellingPrice: 55000 },
      { id: 'p-12', sku: 'BRG-012', barcode: '89912345612', name: 'Biskuit Kaleng Aneka Rasa 350g', category: 'Snack', unit: 'KALENG', costPrice: 38000, sellingPrice: 46000 },
    ])
    .onConflictDoNothing();

  // 4. Seed Outlet Inventory Balances (Idempotent)
  await db
    .insert(inventory)
    .values([
      { id: 'inv-t1-p1', outletId: 'toko-1', productId: 'p-1', stockQty: 85, minAlertQty: 6 },
      { id: 'inv-t2-p1', outletId: 'toko-2', productId: 'p-1', stockQty: 4, minAlertQty: 6 },
      { id: 'inv-t1-p2', outletId: 'toko-1', productId: 'p-2', stockQty: 120, minAlertQty: 10 },
      { id: 'inv-t2-p2', outletId: 'toko-2', productId: 'p-2', stockQty: 3, minAlertQty: 10 },
      { id: 'inv-t1-p3', outletId: 'toko-1', productId: 'p-3', stockQty: 95, minAlertQty: 10 },
      { id: 'inv-t2-p3', outletId: 'toko-2', productId: 'p-3', stockQty: 18, minAlertQty: 10 },
      { id: 'inv-t1-p4', outletId: 'toko-1', productId: 'p-4', stockQty: 60, minAlertQty: 8 },
      { id: 'inv-t2-p4', outletId: 'toko-2', productId: 'p-4', stockQty: 5, minAlertQty: 8 },
      { id: 'inv-t1-p5', outletId: 'toko-1', productId: 'p-5', stockQty: 50, minAlertQty: 8 },
      { id: 'inv-t2-p5', outletId: 'toko-2', productId: 'p-5', stockQty: 14, minAlertQty: 8 },
      { id: 'inv-t1-p6', outletId: 'toko-1', productId: 'p-6', stockQty: 72, minAlertQty: 12 },
      { id: 'inv-t2-p6', outletId: 'toko-2', productId: 'p-6', stockQty: 22, minAlertQty: 12 },
      { id: 'inv-t1-p7', outletId: 'toko-1', productId: 'p-7', stockQty: 40, minAlertQty: 5 },
      { id: 'inv-t2-p7', outletId: 'toko-2', productId: 'p-7', stockQty: 2, minAlertQty: 5 },
      { id: 'inv-t1-p8', outletId: 'toko-1', productId: 'p-8', stockQty: 65, minAlertQty: 8 },
      { id: 'inv-t2-p8', outletId: 'toko-2', productId: 'p-8', stockQty: 16, minAlertQty: 8 },
      { id: 'inv-t1-p9', outletId: 'toko-1', productId: 'p-9', stockQty: 80, minAlertQty: 10 },
      { id: 'inv-t2-p9', outletId: 'toko-2', productId: 'p-9', stockQty: 9, minAlertQty: 10 },
      { id: 'inv-t1-p10', outletId: 'toko-1', productId: 'p-10', stockQty: 55, minAlertQty: 8 },
      { id: 'inv-t2-p10', outletId: 'toko-2', productId: 'p-10', stockQty: 19, minAlertQty: 8 },
      { id: 'inv-t1-p11', outletId: 'toko-1', productId: 'p-11', stockQty: 30, minAlertQty: 5 },
      { id: 'inv-t2-p11', outletId: 'toko-2', productId: 'p-11', stockQty: 3, minAlertQty: 5 },
      { id: 'inv-t1-p12', outletId: 'toko-1', productId: 'p-12', stockQty: 45, minAlertQty: 6 },
      { id: 'inv-t2-p12', outletId: 'toko-2', productId: 'p-12', stockQty: 11, minAlertQty: 6 },
    ])
    .onConflictDoNothing();

  console.log('--- Seed completed successfully (Outlets, 5 Users, 12 Products, 24 Inventory rows) ---');
}

// Allow direct execution via `bun run db:seed` or `bun src/db/seed.ts`
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
