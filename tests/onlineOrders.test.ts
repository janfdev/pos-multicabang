import { describe, it, expect, beforeEach } from 'bun:test';
import app, { _testing } from '../src/server/app';

describe('Online Customer Store & Order Management Test Suite', () => {
  beforeEach(() => {
    // Reset baseline stock for predictable assertions
    _testing.setStock('p-1', 80, 5);  // Beras: T1=80, T2=5
    _testing.setStock('p-2', 100, 4); // Minyak: T1=100, T2=4
  });

  it('should allow customer to create an online order with PENDING status without deducting stock yet', async () => {
    const t2StockBefore = _testing.getInventory()['p-1'].t2Stock; // 5

    const res = await app.request('/api/online-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-2',
        customerName: 'Siti Aminah',
        customerPhone: '081234567890',
        fulfillmentType: 'PICKUP',
        items: [{ productId: 'p-1', qty: 2 }],
        notes: 'Akan diambil siang hari',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.order.id).toMatch(/^ONL-/);
    expect(body.order.status).toBe('PENDING');
    expect(body.order.outletId).toBe('toko-2');
    expect(body.order.totalAmount).toBe(76000 * 2); // 152000

    // Stock should NOT be deducted during PENDING status
    expect(_testing.getInventory()['p-1'].t2Stock).toBe(t2StockBefore);
  });

  it('should reject online checkout if quantity exceeds stock at selected branch', async () => {
    // T2 only has 5 units of p-1; attempt to order 8 units
    const res = await app.request('/api/online-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-2',
        customerName: 'Budi Santoso',
        customerPhone: '081987654321',
        fulfillmentType: 'DELIVERY',
        deliveryAddress: 'Jl. Melati No. 8',
        items: [{ productId: 'p-1', qty: 8 }],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('tidak mencukupi');
  });

  it('should deduct stock atomically when cashier updates status to PROCESSING', async () => {
    const t2StockBefore = _testing.getInventory()['p-2'].t2Stock; // 4

    // 1. Create order
    const createRes = await app.request('/api/online-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-2',
        customerName: 'Dewi Lestari',
        customerPhone: '081211112222',
        fulfillmentType: 'DELIVERY',
        deliveryAddress: 'Jl. Cipto No. 10',
        items: [{ productId: 'p-2', qty: 2 }],
      }),
    });
    const orderId = (await createRes.json()).order.id;

    // 2. Transition PENDING -> PROCESSING
    const processRes = await app.request(`/api/online-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });

    expect(processRes.status).toBe(200);
    const processBody = await processRes.json();
    expect(processBody.order.status).toBe('PROCESSING');

    // Toko 2 stock must decrease by 2! Toko 1 untouched!
    expect(_testing.getInventory()['p-2'].t2Stock).toBe(t2StockBefore - 2);
    expect(_testing.getInventory()['p-2'].t1Stock).toBe(100);

    // 3. Transition to READY then COMPLETED
    const readyRes = await app.request(`/api/online-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READY' }),
    });
    expect(readyRes.status).toBe(200);

    const completeRes = await app.request(`/api/online-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    expect(completeRes.status).toBe(200);
  });

  it('should rollback branch stock if order is CANCELLED after PROCESSING', async () => {
    const t1StockBefore = _testing.getInventory()['p-1'].t1Stock; // 80

    // 1. Order at Toko 1
    const createRes = await app.request('/api/online-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-1',
        customerName: 'Agus Salim',
        customerPhone: '081344445555',
        fulfillmentType: 'PICKUP',
        items: [{ productId: 'p-1', qty: 10 }],
      }),
    });
    const orderId = (await createRes.json()).order.id;

    // 2. Move to PROCESSING -> stock deducted
    await app.request(`/api/online-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    expect(_testing.getInventory()['p-1'].t1Stock).toBe(t1StockBefore - 10);

    // 3. Cancel order -> stock must be rolled back!
    const cancelRes = await app.request(`/api/online-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    expect(cancelRes.status).toBe(200);
    expect(_testing.getInventory()['p-1'].t1Stock).toBe(t1StockBefore);
  });
});
