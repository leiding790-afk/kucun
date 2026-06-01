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

export interface ShipmentItem {
  productName: string;
  sku: string;
  qty: number;
  imageUrl?: string;
}

export interface OutboundShipment {
  id: string;
  date: string; // e.g. "周一"
  timestamp: number;
  location: string;
  trackingNumber: string;
  items: ShipmentItem[];
  totalQty: number;
  status: '待配货' | '配货中' | '在途运输' | '派送中' | '已签收';
  isExpress: boolean;
  statusLog: Array<{
    time: string;
    description: string;
  }>;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: 'admin' | 'operator' | 'guest' | 'super_admin';
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
