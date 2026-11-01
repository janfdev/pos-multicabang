import { describe, it, expect, beforeEach } from 'bun:test';
import app, { _testing } from '../src/server/app';

describe('POS & Multi-Outlet Inventory Engineering Test Suite', () => {
  beforeEach(() => {
    // Reset baseline stock for predictable test assertions
    _testing.setStock('p-1', 85, 4);  // Beras Pandan Wangi (minAlert: 6 -> Toko 2 Low!)
    _testing.setStock('p-2', 120, 3); // Minyak Goreng (minAlert: 10 -> Toko 2 Low!)
    _testing.setStock('p-3', 95, 18); // Gula Pasir (minAlert: 10 -> Safe)
  });

  describe('Group 1: Outlets & Catalog Isolation', () => {
    it('should return healthy status', async () => {
      const res = await app.request('/api/health');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
    });

    it('should return 2 distinct outlets with warehouse and branch designations', async () => {
      const res = await app.request('/api/outlets');
      expect(res.status).toBe(200);
      const outlets = await res.json();
      expect(outlets.length).toBe(2);

      const t1 = outlets.find((o: any) => o.id === 'toko-1');
      const t2 = outlets.find((o: any) => o.id === 'toko-2');

      expect(t1.type).toBe('STORE_WAREHOUSE');
      expect(t2.type).toBe('STORE_BRANCH');
    });

    it('should return outlet-isolated stock on /api/products query', async () => {
      const resT1 = await app.request('/api/products?outletId=toko-1&q=Beras');
      const dataT1 = await resT1.json();
      expect(dataT1.length).toBeGreaterThan(0);
      expect(dataT1[0].stock).toBe(85); // Toko 1 warehouse stock

      const resT2 = await app.request('/api/products?outletId=toko-2&q=Beras');
      const dataT2 = await resT2.json();
      expect(dataT2[0].stock).toBe(4); // Toko 2 satellite branch stock
      expect(dataT2[0].isLow).toBe(true); // 4 <= minAlert(6)
    });
  });

  describe('Group 2: POS Atomic Deductions & Out-of-Stock Protection', () => {
    it('should deduct stock strictly from the active branch during POS checkout', async () => {
      const invBefore = _testing.getInventory()['p-3'];
      const t1Before = invBefore.t1Stock; // 95
      const t2Before = invBefore.t2Stock; // 18

      const checkoutRes = await app.request('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-2',
          items: [{ productId: 'p-3', qty: 2 }],
          paymentMethod: 'CASH',
          cashReceived: 50000,
        }),
      });

      expect(checkoutRes.status).toBe(200);
      const body = await checkoutRes.json();
      expect(body.success).toBe(true);
      expect(body.order.outletId).toBe('toko-2');
      expect(body.order.totalAmount).toBe(35000); // 17500 * 2
      expect(body.order.cashChange).toBe(15000); // 50000 - 35000

      // Toko 2 stock must decrease from 18 to 16
      const invAfter = _testing.getInventory()['p-3'];
      expect(invAfter.t2Stock).toBe(t2Before - 2);
      // Toko 1 warehouse stock MUST remain completely untouched!
      expect(invAfter.t1Stock).toBe(t1Before);
    });

    it('should reject checkout and rollback if requested quantity exceeds branch stock', async () => {
      const invBefore = _testing.getInventory()['p-1'];
      expect(invBefore.t2Stock).toBe(4);

      // Attempt to purchase 10 units at Toko 2 when only 4 are available
      const overOrderRes = await app.request('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-2',
          items: [{ productId: 'p-1', qty: 10 }],
          paymentMethod: 'CASH',
        }),
      });

      expect(overOrderRes.status).toBe(400);
      const resBody = await overOrderRes.json();
      expect(resBody.success).toBe(false);
      expect(resBody.error).toContain('tidak mencukupi');

      // Stock must NOT have decreased
      const invAfter = _testing.getInventory()['p-1'];
      expect(invAfter.t2Stock).toBe(4);
    });
  });

  describe('Group 3: 3-Stage Stock Transfer Protocol', () => {
    it('should enforce Stage 1 (REQUESTED) without touching inventory ledgers', async () => {
      const t1StockBefore = _testing.getInventory()['p-2'].t1Stock;
      const t2StockBefore = _testing.getInventory()['p-2'].t2Stock;

      const reqRes = await app.request('/api/transfers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Restock darurat Toko 2',
          items: [{ productId: 'p-2', qtyRequested: 15 }],
        }),
      });

      expect(reqRes.status).toBe(200);
      const reqData = await reqRes.json();
      expect(reqData.success).toBe(true);
      expect(reqData.transfer.status).toBe('REQUESTED');
      expect(reqData.transfer.items[0].qtyRequested).toBe(15);

      // Inventory MUST remain untouched in Stage 1!
      expect(_testing.getInventory()['p-2'].t1Stock).toBe(t1StockBefore);
      expect(_testing.getInventory()['p-2'].t2Stock).toBe(t2StockBefore);

      const transferId = reqData.transfer.id;

      // Stage 2: DISPATCHED from Toko 1 (Gudang Pusat)
      const dispatchRes = await app.request(`/api/transfers/${transferId}/dispatch`, {
        method: 'POST',
      });
      expect(dispatchRes.status).toBe(200);
      const dispatchData = await dispatchRes.json();
      expect(dispatchData.transfer.status).toBe('DISPATCHED');
      expect(dispatchData.transfer.items[0].qtyDispatched).toBe(15);

      // Warehouse stock must decrease by 15!
      expect(_testing.getInventory()['p-2'].t1Stock).toBe(t1StockBefore - 15);
      // Branch stock has NOT received the goods yet (in transit)!
      expect(_testing.getInventory()['p-2'].t2Stock).toBe(t2StockBefore);

      // Stage 3: RECEIVED at Toko 2 (Cabang Satelit)
      const receiveRes = await app.request(`/api/transfers/${transferId}/receive`, {
        method: 'POST',
      });
      expect(receiveRes.status).toBe(200);
      const receiveData = await receiveRes.json();
      expect(receiveData.transfer.status).toBe('RECEIVED');
      expect(receiveData.transfer.items[0].qtyReceived).toBe(15);

      // Branch stock is now officially replenished (+15)!
      expect(_testing.getInventory()['p-2'].t2Stock).toBe(t2StockBefore + 15);
    });
  });

  describe('Group 4: Monitoring Alerts & Executive KPIs', () => {
    it('should compute low-stock alerts correctly in monitoring matrix', async () => {
      const res = await app.request('/api/inventory/monitoring');
      expect(res.status).toBe(200);
      const matrix = await res.json();

      const p1 = matrix.find((m: any) => m.product.id === 'p-1');
      expect(p1.isToko2Low).toBe(true); // 4 <= 6

      const p3 = matrix.find((m: any) => m.product.id === 'p-3');
      expect(p3.isToko2Low).toBe(false); // 18 > 10
    });

    it('should calculate executive dashboard KPIs and sales trend without zero errors', async () => {
      const res = await app.request('/api/analytics/dashboard');
      expect(res.status).toBe(200);
      const dashboard = await res.json();

      expect(dashboard.kpis.totalProducts).toBe(12);
      expect(dashboard.kpis.totalToko1Stock).toBeGreaterThan(0);
      expect(dashboard.kpis.totalToko2Stock).toBeGreaterThan(0);
      expect(dashboard.kpis.lowStockToko2Count).toBeGreaterThan(0);
      expect(dashboard.salesTrend.length).toBe(7);
      expect(dashboard.recentOrders.length).toBeGreaterThan(0);
    });
  });
});
