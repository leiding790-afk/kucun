export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  warehouseLocation: string;
  imageUrl: string;
  supplier: string;
}

export interface PendingInbound {
  id: string;
  sku: string;
  name: string;
  qty: number;
  supplier: string;
  location: string;
}

export interface OutboundItem {
  productId: string;
  qty: number;
}

export type TabType = 'dashboard' | 'inbound' | 'outbound' | 'inventory';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: 'admin' | 'operator' | 'guest';
  dept?: string;
  createdAt: string;
}

export interface LowStockAlert {
  id: string;
  sku: string;
  name: string;
  qty: number;
  minStock: number;
  imageUrl: string;
}
