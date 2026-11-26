import { describe, it, expect } from 'bun:test';
import app, { _testing } from '../src/server/app';

describe('Full End-to-End (E2E) Business Flow Suite — Proposal POS Multi-Cabang', () => {
  describe('E2E Flow 1: POS Cash Checkout -> Stock Deduction -> Void/Return -> Financial Report Exclusion', () => {
    it('should execute full cash checkout, verify receipt & stock, void with reason, and restore stock atomically', async () => {
      const productId = 'p-1';
      const initialT1 = _testing.getInventory()[productId].t1Stock;
      const initialT2 = _testing.getInventory()[productId].t2Stock;

      // 1. Report baseline before transaction
      const repBeforeRes = await app.request('/api/analytics/financial-report?outletId=toko-1');
      expect(repBeforeRes.status).toBe(200);
      const repBefore = await repBeforeRes.json();

      // 2. Cashier executes Cash Checkout at Toko 1 (2 units x Rp76.000 = Rp152.000, cash Rp200.000 -> change Rp48.000)
      const checkoutRes = await app.request('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-1',
          paymentMethod: 'CASH',
          cashReceived: 200000,
          items: [{ productId, qty: 2 }],
        }),
      });
      expect(checkoutRes.status).toBe(200);
      const checkoutData = await checkoutRes.json();
      expect(checkoutData.success).toBe(true);
      expect(checkoutData.order.totalAmount).toBe(152000);
      expect(checkoutData.order.cashChange).toBe(48000);
      expect(checkoutData.order.status).toBe('COMPLETED');

      // 3. Verify branch-isolated stock deduction (Toko 1 decreased by 2, Toko 2 untouched)
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1 - 2);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2);

      // 4. Verify order appears in POS order history & increases Toko 1 financial report revenue
      const historyRes = await app.request('/api/pos/orders?outletId=toko-1');
      expect(historyRes.status).toBe(200);
      const history = await historyRes.json();
      expect(history.some((o: any) => o.id === checkoutData.order.id)).toBe(true);

      const repAfterCheckout = await (await app.request('/api/analytics/financial-report?outletId=toko-1')).json();
      expect(repAfterCheckout.totalRevenue).toBe(repBefore.totalRevenue + 152000);

      // 5. Cashier voids/returns the transaction with mandatory audit reason (F-13)
      const voidRes = await app.request(`/api/pos/orders/${checkoutData.order.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'E2E Test: Pelanggan batal transaksi di kasir',
          voidedBy: 'Fajar Ramadhan',
        }),
      });
      expect(voidRes.status).toBe(200);
      const voidData = await voidRes.json();
      expect(voidData.success).toBe(true);
      expect(voidData.order.status).toBe('VOIDED');

      // 6. Verify stock is atomically restored and revenue returns to baseline
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1);
      const repAfterVoid = await (await app.request('/api/analytics/financial-report?outletId=toko-1')).json();
      expect(repAfterVoid.totalRevenue).toBe(repBefore.totalRevenue);
    });
  });

  describe('E2E Flow 2: POS Midtrans Sandbox QRIS Payment -> Idempotent Webhook -> Settlement', () => {
    it('should complete end-to-end QRIS charge, hold stock while pending, settle via webhook once, and reflect in status endpoint', async () => {
      const productId = 'p-3'; // Gula Pasir 1kg = Rp17.500
      const initialT2 = _testing.getInventory()[productId].t2Stock;

      // 1. Create Midtrans QRIS Sandbox charge at Toko 2
      const chargeRes = await app.request('/api/pos/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-2',
          cashierName: 'Dewi Lestari',
          items: [{ productId, qty: 2 }],
        }),
      });
      expect(chargeRes.status).toBe(200);
      const chargeData = await chargeRes.json();
      expect(chargeData.success).toBe(true);
      expect(chargeData.transactionStatus).toBe('pending');
      expect(chargeData.grossAmount).toBe(35000);
      expect(chargeData.qrString).toBeTruthy();

      // 2. Stock MUST NOT be deducted while payment is pending
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2);

      // 3. Check polling status endpoint while pending
      const pendingStatus = await (await app.request(`/api/pos/midtrans/status/${chargeData.orderId}`)).json();
      expect(pendingStatus.status).toBe('pending');

      // 4. Simulate Midtrans settlement webhook callback
      const webhookPayload = {
        order_id: chargeData.orderId,
        transaction_status: 'settlement',
        payment_type: 'qris',
        gross_amount: '35000.00',
        signature_key: 'sandbox-valid-sig',
      };

      const settleRes = await app.request('/api/pos/midtrans/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });
      expect(settleRes.status).toBe(200);
      const settleData = await settleRes.json();
      expect(settleData.success).toBe(true);
      expect(settleData.status).toBe('SETTLED');
      expect(settleData.order.paymentMethod).toBe('QRIS_MIDTRANS');

      // 5. Stock deducted atomically once
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2 - 2);

      // 6. Replay exact same webhook (idempotency guard) -> stock must NOT deduct again
      const replayRes = await app.request('/api/pos/midtrans/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });
      expect(replayRes.status).toBe(200);
      const replayData = await replayRes.json();
      expect(replayData.alreadyProcessed).toBe(true);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2 - 2);

      // 7. Status endpoint reflects settlement
      const finalStatus = await (await app.request(`/api/pos/midtrans/status/${chargeData.orderId}`)).json();
      expect(finalStatus.status).toBe('settlement');

      // Restore stock for test isolation
      _testing.setStock(productId, _testing.getInventory()[productId].t1Stock, initialT2);
    });
  });

  describe('E2E Flow 3: Online Shop -> Delivery Fee -> Pending Alert -> Processing -> History & Re-Order', () => {
    it('should execute full customer online order lifecycle from checkout to cashier alert, fulfillment, and re-order validation', async () => {
      const productId = 'p-2'; // Minyak Goreng 2L = Rp36.500
      const initialT1 = _testing.getInventory()[productId].t1Stock;
      const customerPhone = '081288001122';

      // 1. Customer places DELIVERY order for 1 unit (Rp36.500 -> >= 30k, < 50k -> Rp5.000 shipping fee = Rp41.500)
      const createRes = await app.request('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-1',
          customerName: 'Ibu Kartini E2E',
          customerPhone,
          fulfillmentType: 'DELIVERY',
          deliveryAddress: 'Jl. Pemuda Gang 2 No. 8, Cirebon',
          items: [{ productId, qty: 1 }],
        }),
      });
      expect(createRes.status).toBe(200);
      const created = await createRes.json();
      expect(created.success).toBe(true);
      expect(created.order.subtotal).toBe(36500);
      expect(created.order.deliveryFee).toBe(5000);
      expect(created.order.totalAmount).toBe(41500);
      expect(created.order.status).toBe('PENDING');

      // Stock untouched while PENDING
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1);

      // 2. Cashier receives live pending-count alert for Toko 1
      const alertRes = await app.request('/api/online-orders/pending-count?outletId=toko-1');
      expect(alertRes.status).toBe(200);
      const alertData = await alertRes.json();
      expect(alertData.pendingCount).toBeGreaterThanOrEqual(1);
      expect(alertData.latestOrder.id).toBe(created.order.id);

      // 3. Cashier moves order PENDING -> PROCESSING (stock deducted atomically)
      const procRes = await app.request(`/api/online-orders/${created.order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' }),
      });
      expect(procRes.status).toBe(200);
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1 - 1);

      // 4. Customer looks up order history via normalized +62 phone format (F-22)
      const lookupRes = await app.request('/api/online-orders?phone=6281288001122');
      expect(lookupRes.status).toBe(200);
      const lookupList = await lookupRes.json();
      expect(lookupList.some((o: any) => o.id === created.order.id && o.status === 'PROCESSING')).toBe(true);

      // 5. Customer triggers 1-click Re-Order validation (F-22)
      const reorderRes = await app.request(`/api/online-orders/${created.order.id}/reorder`);
      expect(reorderRes.status).toBe(200);
      const reorderData = await reorderRes.json();
      expect(reorderData.success).toBe(true);
      expect(reorderData.items[0].productId).toBe(productId);
      expect(reorderData.items[0].adjustedQty).toBe(1);
      expect(reorderData.items[0].currentUnitPrice).toBe(36500);

      // 6. Cancel order after PROCESSING -> verify atomic rollback
      const cancelRes = await app.request(`/api/online-orders/${created.order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      expect(cancelRes.status).toBe(200);
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1);
    });
  });

  describe('E2E Flow 4: 3-Stage Stock Transfer & Physical Stock Opname Audit', () => {
    it('should execute full 3-stage transfer (Request -> Dispatch -> Receive) and verify Stock Opname discrepancy audit', async () => {
      const productId = 'p-4';
      const initialT1 = _testing.getInventory()[productId].t1Stock;
      const initialT2 = _testing.getInventory()[productId].t2Stock;

      // 1. Stage 1: Toko 2 requests 5 units from Toko 1 (stocks untouched)
      const reqRes = await app.request('/api/transfers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromOutletId: 'toko-1',
          toOutletId: 'toko-2',
          notes: 'E2E Restock Tepung Terigu',
          items: [{ productId, qtyRequested: 5 }],
        }),
      });
      expect(reqRes.status).toBe(200);
      const transferId = (await reqRes.json()).transfer.id;
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2);

      // 2. Stage 2: Warehouse dispatches 5 units (Toko 1 deducted, Toko 2 still untouched)
      const dispRes = await app.request(`/api/transfers/${transferId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName: 'Kurir E2E', dispatchedBy: 'Rian Kurniawan' }),
      });
      expect(dispRes.status).toBe(200);
      expect(_testing.getInventory()[productId].t1Stock).toBe(initialT1 - 5);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2);

      // 3. Stage 3: Branch Staff confirms goods receipt (Toko 2 credited +5)
      const recRes = await app.request(`/api/transfers/${transferId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedBy: 'Agus Setiawan' }),
      });
      expect(recRes.status).toBe(200);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2 + 5);

      // 4. Physical Stock Opname at Toko 2 (-1 damaged pack) with mandatory reason
      const opnameRes = await app.request('/api/inventory/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'toko-2',
          productId,
          actualStock: initialT2 + 4,
          reason: 'E2E Opname: 1 bungkus tepung sobek saat bongkar muat',
          adjustedBy: 'Agus Setiawan',
        }),
      });
      expect(opnameRes.status).toBe(200);
      const opnameData = await opnameRes.json();
      expect(opnameData.opname.difference).toBe(-1);
      expect(_testing.getInventory()[productId].t2Stock).toBe(initialT2 + 4);

      // Restore stocks
      _testing.setStock(productId, initialT1, initialT2);
    });
  });

  describe('E2E Flow 5: Separated Per-Store Dashboard KPI Consistency', () => {
    it('should return consistent HQ, Toko 1, and Toko 2 metrics from /api/analytics/dashboard', async () => {
      const res = await app.request('/api/analytics/dashboard');
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.kpis.toko1.totalStock).toBe(data.kpis.totalToko1Stock);
      expect(data.kpis.toko2.totalStock).toBe(data.kpis.totalToko2Stock);
      expect(data.kpis.toko1.totalRevenue + data.kpis.toko2.totalRevenue).toBe(data.kpis.todayRevenue);
    });
  });
});
