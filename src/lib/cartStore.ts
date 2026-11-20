export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  maxStock: number;
  image?: string;
  outletId: 'toko-1' | 'toko-2';
  outletName: string;
}

const CART_STORAGE_KEY = 'pos-multicabang-customer-cart';

class CartStore {
  private items: CartItem[] = [];
  private listeners: Set<(items: CartItem[]) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          this.items = JSON.parse(stored);
        }
      } catch {
        this.items = [];
      }
    }
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotalCount(): number {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  addItem(
    product: {
      id: string;
      name: string;
      sellingPrice: number;
      unit: string;
      stock: number;
      image?: string;
      outletId?: 'toko-1' | 'toko-2';
      outletName?: string;
    },
    qtyToAdd: number = 1
  ): boolean {
    const existing = this.items.find((item) => item.productId === product.id);
    const available = product.stock ?? 99;

    if (existing) {
      const nextQty = existing.qty + qtyToAdd;
      if (nextQty > available) {
        existing.qty = available;
      } else {
        existing.qty = nextQty;
      }
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        qty: Math.min(qtyToAdd, available),
        unit: product.unit,
        maxStock: available,
        image: product.image,
        outletId: product.outletId || 'toko-1',
        outletName: product.outletName || 'Toko 1 (Pusat & Gudang)',
      });
    }

    this.persist();
    return true;
  }

  updateQty(productId: string, delta: number): void {
    const target = this.items.find((item) => item.productId === productId);
    if (!target) return;

    const nextQty = target.qty + delta;
    if (nextQty <= 0) {
      this.items = this.items.filter((item) => item.productId !== productId);
    } else if (nextQty <= target.maxStock) {
      target.qty = nextQty;
    }
    this.persist();
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((item) => item.productId !== productId);
    this.persist();
  }

  clearCart(): void {
    this.items = [];
    this.persist();
  }

  subscribe(listener: (items: CartItem[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      } catch {}
    }
    this.listeners.forEach((fn) => fn([...this.items]));
  }
}

export const cartStore = new CartStore();
