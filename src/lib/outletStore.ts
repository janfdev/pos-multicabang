export type OutletId = 'toko-1' | 'toko-2';

export interface OutletInfo {
  id: OutletId;
  name: string;
  shortName: string;
  type: 'STORE_WAREHOUSE' | 'STORE_BRANCH';
  address: string;
}

export const OUTLET_CONFIG: Record<OutletId, OutletInfo> = {
  'toko-1': {
    id: 'toko-1',
    name: 'Toko 1 (Pusat & Gudang)',
    shortName: 'Toko 1 (Gudang)',
    type: 'STORE_WAREHOUSE',
    address: 'Jl. Pemuda No. 12, Cirebon',
  },
  'toko-2': {
    id: 'toko-2',
    name: 'Toko 2 (Cabang Satelit)',
    shortName: 'Toko 2 (Cabang)',
    type: 'STORE_BRANCH',
    address: 'Jl. Kesambi No. 45, Cirebon',
  },
};

type Listener = (outletId: OutletId) => void;

class OutletStore {
  private currentOutlet: OutletId = 'toko-2';
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pos_active_outlet') as OutletId;
        if (saved === 'toko-1' || saved === 'toko-2') {
          this.currentOutlet = saved;
        }
      } catch {}
    }
  }

  public getOutlet(): OutletId {
    return this.currentOutlet;
  }

  public getOutletInfo(): OutletInfo {
    return OUTLET_CONFIG[this.currentOutlet];
  }

  public setOutlet(id: OutletId) {
    if (id !== this.currentOutlet) {
      this.currentOutlet = id;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pos_active_outlet', id);
        } catch {}
      }
      this.listeners.forEach((fn) => fn(id));
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const outletStore = new OutletStore();
