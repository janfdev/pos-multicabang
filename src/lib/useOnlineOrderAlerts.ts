import { useState, useEffect, useRef, useCallback } from 'react';
import { playNotificationChime } from './audio';

export interface PendingOrderSummary {
  id: string;
  outletId: string;
  customerName: string;
  totalAmount: number;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  createdAt: string;
}

export function useOnlineOrderAlerts(
  outletId: string = 'ALL',
  onNewOrder?: (order: PendingOrderSummary) => void
) {
  const [pendingCount, setPendingCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<PendingOrderSummary | null>(null);
  const initializedRef = useRef(false);
  const lastSeenIdRef = useRef<string | null>(null);
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  const fetchPending = useCallback(async () => {
    try {
      const param = outletId && outletId !== 'ALL' ? `?outletId=${encodeURIComponent(outletId)}` : '';
      const res = await fetch(`/api/online-orders/pending-count${param}`);
      if (!res.ok) return;
      const data = await res.json();
      const count = Number(data.pendingCount || 0);
      const latest: PendingOrderSummary | null = data.latestOrder || null;

      setPendingCount(count);
      setLatestOrder(latest);

      if (initializedRef.current && latest && latest.id !== lastSeenIdRef.current) {
        playNotificationChime();
        onNewOrderRef.current?.(latest);
      }
      if (latest) {
        lastSeenIdRef.current = latest.id;
      }
      initializedRef.current = true;
    } catch {
      // ignore transient network errors during background polling
    }
  }, [outletId]);

  useEffect(() => {
    initializedRef.current = false;
    fetchPending();
    const timer = setInterval(fetchPending, 15000);
    return () => clearInterval(timer);
  }, [fetchPending]);

  return { pendingCount, latestOrder, refresh: fetchPending };
}
