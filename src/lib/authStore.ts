import { outletStore, OutletId } from './outletStore';

export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'BRANCH_STAFF';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  outletId: OutletId | 'ALL';
  outletName: string;
  avatar: string;
}

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  user: UserProfile;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Pemilik Toko (Super Admin)',
    email: 'owner@pos.id',
    password: 'password123',
    user: {
      id: 'usr-owner',
      name: 'H. Budi Santoso',
      email: 'owner@pos.id',
      role: 'OWNER',
      roleLabel: 'Pemilik / Super Admin (Lintas Gerai)',
      outletId: 'ALL',
      outletName: 'Semua Cabang (Konsolidasi)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    },
  },
  {
    label: 'Petugas Gudang Toko 1',
    email: 'gudang@pos.id',
    password: 'password123',
    user: {
      id: 'usr-gudang-t1',
      name: 'Rian Kurniawan',
      email: 'gudang@pos.id',
      role: 'WAREHOUSE',
      roleLabel: 'Petugas Gudang Toko 1 (Pusat & Pasokan)',
      outletId: 'toko-1',
      outletName: 'Toko 1 (Pusat & Gudang)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
  },
  {
    label: 'Kasir Toko 1 (Pusat)',
    email: 'kasir1@pos.id',
    password: 'password123',
    user: {
      id: 'usr-kasir-t1',
      name: 'Fajar Ramadhan',
      email: 'kasir1@pos.id',
      role: 'CASHIER',
      roleLabel: 'Kasir POS Toko 1 (Pusat)',
      outletId: 'toko-1',
      outletName: 'Toko 1 (Pusat & Gudang)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    },
  },
  {
    label: 'Kasir Toko 2 (Cabang)',
    email: 'kasir2@pos.id',
    password: 'password123',
    user: {
      id: 'usr-kasir-t2',
      name: 'Dewi Lestari',
      email: 'kasir2@pos.id',
      role: 'CASHIER',
      roleLabel: 'Kasir POS Toko 2 (Cabang Satelit)',
      outletId: 'toko-2',
      outletName: 'Toko 2 (Cabang Satelit)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    },
  },
  {
    label: 'Petugas Toko 2 (Cabang)',
    email: 'staf2@pos.id',
    password: 'password123',
    user: {
      id: 'usr-staf-t2',
      name: 'Agus Setiawan',
      email: 'staf2@pos.id',
      role: 'BRANCH_STAFF',
      roleLabel: 'Petugas Gerai Toko 2 (Cabang)',
      outletId: 'toko-2',
      outletName: 'Toko 2 (Cabang Satelit)',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces',
    },
  },
];

type AuthListener = (user: UserProfile | null) => void;

class AuthStore {
  private currentUser: UserProfile | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pos_auth_user');
        if (saved) {
          this.currentUser = JSON.parse(saved);
        } else {
          // Default initial session is Toko 2 Cashier for immediate readiness
          this.currentUser = DEMO_ACCOUNTS[1].user;
          localStorage.setItem('pos_auth_user', JSON.stringify(this.currentUser));
        }
      } catch {
        this.currentUser = DEMO_ACCOUNTS[1].user;
      }
    } else {
      this.currentUser = DEMO_ACCOUNTS[1].user;
    }
  }

  public getUser(): UserProfile | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public login(email: string, password: string): { success: boolean; error?: string } {
    const account = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!account) {
      return { success: false, error: 'Email atau password salah.' };
    }

    if (password !== account.password && password !== 'password123') {
      return { success: false, error: 'Password tidak sesuai.' };
    }

    this.setUser(account.user);
    return { success: true };
  }

  public loginWithDemo(account: DemoAccount) {
    this.setUser(account.user);
  }

  public logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('pos_auth_user');
      } catch {}
    }
    this.listeners.forEach((fn) => fn(null));
  }

  public setUser(user: UserProfile) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pos_auth_user', JSON.stringify(user));
      } catch {}
    }

    // Automatically synchronize with outletStore
    if (user.outletId === 'toko-1' || user.outletId === 'toko-2') {
      outletStore.setOutlet(user.outletId);
    }

    this.listeners.forEach((fn) => fn(user));
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const authStore = new AuthStore();
