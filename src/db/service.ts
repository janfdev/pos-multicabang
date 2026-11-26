import { db } from './client.js';
import {
  outlets,
  products,
  inventory,
  orders,
  orderItems,
  stockTransfers,
  transferItems,
  onlineOrders,
  onlineOrderItems,
  stockOpnameLogs,
} from './schema.js';
import { sql } from 'drizzle-orm';

export class DbService {
  static async testConnection(): Promise<boolean> {
    try {
      if (!process.env.DATABASE_URL) return false;
      await db.select({ count: sql`1` }).from(outlets).limit(1);
      return true;
    } catch {
      return false;
    }
  }

  static async getOutlets() {
    try {
      return await db.select().from(outlets);
    } catch {
      return null;
    }
  }

  static async getProductsWithInventory() {
    try {
      const prods = await db.select().from(products);
      const invs = await db.select().from(inventory);

      return prods.map((p) => {
        const t1Inv = invs.find((i) => i.productId === p.id && i.outletId === 'toko-1');
        const t2Inv = invs.find((i) => i.productId === p.id && i.outletId === 'toko-2');
        return {
          ...p,
          t1Stock: t1Inv?.stockQty ?? 0,
          t2Stock: t2Inv?.stockQty ?? 0,
          minAlert: t2Inv?.minAlertQty ?? 6,
        };
      });
    } catch {
      return null;
    }
  }

  static async recordOrder(orderData: {
    id: string;
    outletId: string;
    totalAmount: number;
    paymentMethod: string;
    cashReceived?: number;
    cashChange?: number;
    cashierName?: string;
    items: Array<{
      productId: string;
      productName: string;
      qty: number;
      unitPrice: number;
      subtotal: number;
    }>;
  }) {
    try {
      await db.insert(orders).values({
        id: orderData.id,
        outletId: orderData.outletId,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        cashReceived: orderData.cashReceived,
        cashChange: orderData.cashChange,
        cashierName: orderData.cashierName || 'Kasir',
      });

      for (const item of orderData.items) {
        await db.insert(orderItems).values({
          id: `${orderData.id}-${item.productId}`,
          orderId: orderData.id,
          productId: item.productId,
          productName: item.productName,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });

        // Deduct inventory
        await db
          .update(inventory)
          .set({
            stockQty: sql`GREATEST(0, ${inventory.stockQty} - ${item.qty})`,
            updatedAt: new Date(),
          })
          .where(
            sql`${inventory.outletId} = ${orderData.outletId} AND ${inventory.productId} = ${item.productId}`
          );
      }
      return true;
    } catch (e) {
      console.error('Failed to record order to DB:', e);
      return false;
    }
  }

  static async recordStockTransfer(transferData: {
    id: string;
    fromOutletId: string;
    toOutletId: string;
    type: 'RESTOCK' | 'RETURN' | 'REBALANCE';
    notes?: string;
    items: Array<{
      productId: string;
      qtyRequested: number;
    }>;
  }) {
    try {
      await db.insert(stockTransfers).values({
        id: transferData.id,
        fromOutletId: transferData.fromOutletId,
        toOutletId: transferData.toOutletId,
        type: transferData.type,
        status: 'REQUESTED',
        notes: transferData.notes,
      });

      for (const item of transferData.items) {
        await db.insert(transferItems).values({
          id: `${transferData.id}-${item.productId}`,
          transferId: transferData.id,
          productId: item.productId,
          qtyRequested: item.qtyRequested,
          qtyDispatched: 0,
          qtyReceived: 0,
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to record transfer to DB:', e);
      return false;
    }
  }

  static async recordOnlineOrder(orderData: {
    id: string;
    outletId: string;
    customerName: string;
    customerPhone: string;
    fulfillmentType: 'PICKUP' | 'DELIVERY';
    deliveryAddress?: string;
    totalAmount: number;
    notes?: string;
    items: Array<{
      productId: string;
      productName: string;
      qty: number;
      unitPrice: number;
      subtotal: number;
    }>;
  }) {
    try {
      await db.insert(onlineOrders).values({
        id: orderData.id,
        outletId: orderData.outletId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        fulfillmentType: orderData.fulfillmentType,
        deliveryAddress: orderData.deliveryAddress,
        totalAmount: orderData.totalAmount,
        notes: orderData.notes,
        status: 'PENDING',
      });

      for (const item of orderData.items) {
        await db.insert(onlineOrderItems).values({
          id: `${orderData.id}-${item.productId}`,
          orderId: orderData.id,
          productId: item.productId,
          productName: item.productName,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to record online order to DB:', e);
      return false;
    }
  }

  static async recordStockOpname(opnameData: {
    id: string;
    outletId: string;
    outletName: string;
    productId: string;
    productName: string;
    sku: string;
    previousStock: number;
    actualStock: number;
    difference: number;
    reason: string;
    adjustedBy: string;
  }) {
    try {
      await db.insert(stockOpnameLogs).values({
        id: opnameData.id,
        outletId: opnameData.outletId,
        outletName: opnameData.outletName,
        productId: opnameData.productId,
        productName: opnameData.productName,
        sku: opnameData.sku,
        previousStock: opnameData.previousStock,
        actualStock: opnameData.actualStock,
        difference: opnameData.difference,
        reason: opnameData.reason,
        adjustedBy: opnameData.adjustedBy,
      });

      await db
        .update(inventory)
        .set({
          stockQty: opnameData.actualStock,
          updatedAt: new Date(),
        })
        .where(
          sql`${inventory.outletId} = ${opnameData.outletId} AND ${inventory.productId} = ${opnameData.productId}`
        );

      return true;
    } catch (e) {
      console.error('Failed to record stock opname to DB:', e);
      return false;
    }
  }

  static async voidOrder(voidData: {
    orderId: string;
    outletId: string;
    reason: string;
    voidedBy: string;
    items: Array<{ productId: string; qty: number }>;
  }) {
    try {
      await db
        .update(orders)
        .set({
          status: 'VOIDED',
          voidReason: voidData.reason,
          voidedBy: voidData.voidedBy,
          voidedAt: new Date(),
        })
        .where(sql`${orders.id} = ${voidData.orderId}`);

      for (const item of voidData.items) {
        await db
          .update(inventory)
          .set({
            stockQty: sql`${inventory.stockQty} + ${item.qty}`,
            updatedAt: new Date(),
          })
          .where(
            sql`${inventory.outletId} = ${voidData.outletId} AND ${inventory.productId} = ${item.productId}`
          );
      }

      return true;
    } catch (e) {
      console.error('Failed to persist voided order to DB:', e);
      return false;
    }
  }
}
