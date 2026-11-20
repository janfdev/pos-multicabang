import { db } from './client';
import { outlets, products, inventory } from './schema';

export async function seedDatabase() {
  console.log('--- Starting Neon PostgreSQL Database Seed ---');

  // 1. Seed Outlets
  const existingOutlets = await db.select().from(outlets);
  if (existingOutlets.length === 0) {
    console.log('Seeding Outlets...');
    await db.insert(outlets).values([
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
    ]);
  }

  // 2. Seed Products
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    console.log('Seeding Master Products...');
    await db.insert(products).values([
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
    ]);
  }

  // 3. Seed Inventory
  const existingInventory = await db.select().from(inventory);
  if (existingInventory.length === 0) {
    console.log('Seeding Outlet Inventory Balances...');
    const inventoryBalances: Array<{
      id: string;
      outletId: string;
      productId: string;
      stockQty: number;
      minAlertQty: number;
    }> = [
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
    ];
    await db.insert(inventory).values(inventoryBalances);
  }

  console.log('--- Seed completed successfully ---');
}
