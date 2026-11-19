import { describe, it, expect } from 'bun:test';
import app from '../src/server/app';

describe('Financial Report & Profit/Loss Analysis Test Suite', () => {
  it('should return consolidated financial report across all outlets', async () => {
    const res = await app.request('/api/reports/financial?outletId=ALL');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.grossRevenue).toBeGreaterThan(0);
    expect(data.totalCost).toBeGreaterThan(0);
    expect(data.grossProfit).toBe(data.grossRevenue - data.totalCost);
    expect(data.grossMarginPct).toBeGreaterThan(0);
    expect(data.totalTransactions).toBeGreaterThan(0);
    expect(Array.isArray(data.topProducts)).toBe(true);
    expect(data.topProducts.length).toBeGreaterThan(0);
  });

  it('should filter financial report by specific outlet (toko-1)', async () => {
    const res = await app.request('/api/reports/financial?outletId=toko-1');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.outletId).toBe('toko-1');
    expect(data.grossRevenue).toBeGreaterThanOrEqual(0);
  });

  it('should calculate individual product profit and margin correctly', async () => {
    const res = await app.request('/api/reports/financial?outletId=ALL');
    const data = await res.json();

    const firstProduct = data.topProducts[0];
    if (firstProduct) {
      expect(firstProduct.profit).toBe(firstProduct.revenue - firstProduct.cost);
      expect(Number(firstProduct.margin)).toBeGreaterThan(0);
    }
  });
});
