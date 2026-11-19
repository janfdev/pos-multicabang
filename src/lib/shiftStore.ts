export type ShiftSession = {
  id: string;
  outletId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashSales: number;
  qrisSales: number;
  totalTransactions: number;
  actualCashInDrawer?: number;
  cashDiscrepancy?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
};

const STORAGE_KEY = 'pos_cashier_shift_session';

export const shiftStore = {
  getActiveShift(outletId: string): ShiftSession | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${outletId}`);
      if (!raw) return null;
      const parsed: ShiftSession = JSON.parse(raw);
      return parsed.status === 'OPEN' ? parsed : null;
    } catch {
      return null;
    }
  },

  openShift(outletId: string, cashierName: string, initialCash: number): ShiftSession {
    const shift: ShiftSession = {
      id: `SHF-${Date.now().toString().slice(-6)}`,
      outletId,
      cashierName,
      openedAt: new Date().toISOString(),
      initialCash,
      cashSales: 0,
      qrisSales: 0,
      totalTransactions: 0,
      status: 'OPEN',
    };
    localStorage.setItem(`${STORAGE_KEY}_${outletId}`, JSON.stringify(shift));
    return shift;
  },

  recordTransaction(outletId: string, paymentMethod: 'CASH' | 'QRIS', amount: number) {
    const current = this.getActiveShift(outletId);
    if (!current) return null;

    if (paymentMethod === 'CASH') {
      current.cashSales += amount;
    } else {
      current.qrisSales += amount;
    }
    current.totalTransactions += 1;
    localStorage.setItem(`${STORAGE_KEY}_${outletId}`, JSON.stringify(current));
    return current;
  },

  closeShift(outletId: string, actualCashInDrawer: number, notes?: string): ShiftSession | null {
    const current = this.getActiveShift(outletId);
    if (!current) return null;

    const expectedCash = current.initialCash + current.cashSales;
    current.actualCashInDrawer = actualCashInDrawer;
    current.cashDiscrepancy = actualCashInDrawer - expectedCash;
    current.closedAt = new Date().toISOString();
    current.status = 'CLOSED';
    if (notes) current.notes = notes;

    localStorage.setItem(`${STORAGE_KEY}_${outletId}`, JSON.stringify(current));
    // Save to historical log
    try {
      const histRaw = localStorage.getItem(`pos_shift_history_${outletId}`) || '[]';
      const history: ShiftSession[] = JSON.parse(histRaw);
      history.unshift(current);
      localStorage.setItem(`pos_shift_history_${outletId}`, JSON.stringify(history.slice(0, 50)));
    } catch {}

    return current;
  },

  getShiftHistory(outletId: string): ShiftSession[] {
    try {
      const histRaw = localStorage.getItem(`pos_shift_history_${outletId}`) || '[]';
      return JSON.parse(histRaw);
    } catch {
      return [];
    }
  },
};
