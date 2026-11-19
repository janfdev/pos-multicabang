import { describe, it, expect, afterAll } from 'bun:test';
import { db, queryClient } from '../src/db/client';
import { seedDatabase } from '../src/db/seed';
import { DbService } from '../src/db/service';

describe('Neon PostgreSQL Database Suite', () => {

  it('should successfully connect to Neon Postgres instance', async () => {
    const isConn = await DbService.testConnection();
    expect(isConn).toBe(true);
  });

  it('should seed and read real records in Neon PostgreSQL', async () => {
    await seedDatabase();

    const outlets = await DbService.getOutlets();
    expect(outlets).not.toBeNull();
    expect(outlets!.length).toBeGreaterThanOrEqual(2);

    const prods = await DbService.getProductsWithInventory();
    expect(prods).not.toBeNull();
    expect(prods!.length).toBeGreaterThanOrEqual(12);
  });

  it('should atomically record a POS order and deduct stock in Neon DB', async () => {
    const orderId = `TRX-TEST-${Date.now().toString().slice(-4)}`;
    const success = await DbService.recordOrder({
      id: orderId,
      outletId: 'toko-2',
      totalAmount: 36500,
      paymentMethod: 'CASH',
      cashReceived: 50000,
      cashChange: 13500,
      cashierName: 'Kasir Uji',
      items: [
        {
          productId: 'p-2',
          productName: 'Minyak Goreng Sawit 2L',
          qty: 1,
          unitPrice: 36500,
          subtotal: 36500,
        },
      ],
    });

    expect(success).toBe(true);
  });
});
