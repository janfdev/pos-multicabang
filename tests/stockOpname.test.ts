import { describe, it, expect, beforeEach } from 'bun:test';
import app, { _testing } from '../src/server/app';

describe('Inventory Stock Opname & Audit Logging Test Suite (Proposal F-08 & F-09)', () => {
  beforeEach(() => {
    // Reset baseline stock for predictable assertions
    _testing.setStock('p-1', 85, 10);
    _testing.setStock('p-2', 120, 20);
  });

  it('should adjust physical stock with discrepancy calculation and audit log', async () => {
    // Toko 2 has 10 units of p-1. Physical count reveals only 8 units (difference -2).
    const res = await app.request('/api/inventory/stock-opname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-2',
        productId: 'p-1',
        actualStock: 8,
        reason: 'Kemasan sobek saat penyusunan rak display',
        adjustedBy: 'Kasir Toko 2',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.opname.previousStock).toBe(10);
    expect(body.opname.actualStock).toBe(8);
    expect(body.opname.difference).toBe(-2);
    expect(body.opname.reason).toBe('Kemasan sobek saat penyusunan rak display');

    // Toko 2 stock in memory must be updated to 8! Toko 1 untouched!
    expect(_testing.getInventory()['p-1'].t2Stock).toBe(8);
    expect(_testing.getInventory()['p-1'].t1Stock).toBe(85);
  });

  it('should reject stock opname if reason is not provided (Business Rule 11)', async () => {
    const res = await app.request('/api/inventory/stock-opname', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: 'toko-2',
        productId: 'p-1',
        actualStock: 8,
        reason: '', // Empty reason!
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Alasan penyesuaian wajib diisi');
  });

  it('should return opname history audit log', async () => {
    const auditRes = await app.request('/api/inventory/stock-opname/audit?outletId=toko-2');
    expect(auditRes.status).toBe(200);
    const auditList = await auditRes.json();
    expect(Array.isArray(auditList)).toBe(true);
  });
});
