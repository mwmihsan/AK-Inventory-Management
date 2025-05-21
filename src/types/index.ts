export interface Product {
  id: string;
  name: string;
  barcode?: string;
  category: string;
  unit: 'kg' | 'g' | 'lb' | 'oz' | 'piece';
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  leadTime: number; // in days
  notes?: string;
  addedDate: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
  addedDate: string;
  lastUpdated: string;
}

export interface Purchase {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  supplierName: string;
  paymentMethod: 'cash' | 'credit' | 'cheque';
  notes?: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'critical' | 'low' | 'reorder';
}

export type ChartPeriod = 'week' | 'month' | 'quarter' | 'year';