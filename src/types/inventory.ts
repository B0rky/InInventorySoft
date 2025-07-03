
export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  purchasePrice: number; // Precio de compra/fabricación
  salePrice: number; // Precio de venta
  description?: string;
  supplier?: string;
  lastUpdated: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: Date;
  customer?: string;
}

export interface KPI {
  id: string;
  title: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  percentage?: number;
  icon: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'meeting' | 'delivery' | 'reminder' | 'other';
}

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatar?: string;
}

export interface ReportFilter {
  category?: string;
  stockLevel?: 'all' | 'low' | 'normal' | 'high';
  dateFrom?: Date;
  dateTo?: Date;
}
