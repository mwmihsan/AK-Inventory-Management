import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Supplier, Purchase } from '../types';
import { supabase, DatabaseProduct, DatabaseSupplier, DatabasePurchase } from '../lib/supabase';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'addedDate' | 'lastUpdated'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'addedDate' | 'lastUpdated'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<void>;
  getLowStockProducts: () => Product[];
  getRecentPurchases: (days: number) => Purchase[];
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Helper functions to transform database records to app types
const transformProduct = (dbProduct: DatabaseProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  barcode: dbProduct.barcode,
  category: dbProduct.category,
  unit: dbProduct.unit,
  unitPrice: dbProduct.unit_price,
  currentStock: dbProduct.current_stock,
  minStockLevel: dbProduct.min_stock_level,
  leadTime: dbProduct.lead_time,
  notes: dbProduct.notes,
  addedDate: dbProduct.added_date,
  lastUpdated: dbProduct.last_updated,
});

const transformSupplier = (dbSupplier: DatabaseSupplier): Supplier => ({
  id: dbSupplier.id,
  name: dbSupplier.name,
  contactPerson: dbSupplier.contact_person,
  email: dbSupplier.email,
  phone: dbSupplier.phone,
  address: dbSupplier.address,
  notes: dbSupplier.notes,
  addedDate: dbSupplier.added_date,
  lastUpdated: dbSupplier.last_updated,
});

const transformPurchase = (dbPurchase: DatabasePurchase): Purchase => ({
  id: dbPurchase.id,
  date: dbPurchase.date,
  productId: dbPurchase.product_id,
  productName: dbPurchase.product_name,
  quantity: dbPurchase.quantity,
  unitPrice: dbPurchase.unit_price,
  totalPrice: dbPurchase.total_price,
  supplierId: dbPurchase.supplier_id,
  supplierName: dbPurchase.supplier_name,
  paymentMethod: dbPurchase.payment_method,
  notes: dbPurchase.notes,
});

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (suppliersError) throw suppliersError;

      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('date', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Transform and set data
      setProducts(productsData?.map(transformProduct) || []);
      setSuppliers(suppliersData?.map(transformSupplier) || []);
      setPurchases(purchasesData?.map(transformPurchase) || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id' | 'addedDate' | 'lastUpdated'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          barcode: productData.barcode,
          category: productData.category,
          unit: productData.unit,
          unit_price: productData.unitPrice,
          current_stock: productData.currentStock,
          min_stock_level: productData.minStockLevel,
          lead_time: productData.leadTime,
          notes: productData.notes,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newProduct = transformProduct(data);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          unit: product.unit,
          unit_price: product.unitPrice,
          current_stock: product.currentStock,
          min_stock_level: product.minStockLevel,
          lead_time: product.leadTime,
          notes: product.notes,
        })
        .eq('id', product.id);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  // Supplier operations
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'addedDate' | 'lastUpdated'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplierData.name,
          contact_person: supplierData.contactPerson,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address,
          notes: supplierData.notes,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newSupplier = transformSupplier(data);
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(err instanceof Error ? err.message : 'Failed to add supplier');
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          contact_person: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          notes: supplier.notes,
        })
        .eq('id', supplier.id);

      if (error) throw error;

      // Update local state
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError(err instanceof Error ? err.message : 'Failed to update supplier');
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete supplier');
    }
  };

  // Purchase operations
  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          date: purchaseData.date,
          product_id: purchaseData.productId,
          product_name: purchaseData.productName,
          quantity: purchaseData.quantity,
          unit_price: purchaseData.unitPrice,
          total_price: purchaseData.totalPrice,
          supplier_id: purchaseData.supplierId,
          supplier_name: purchaseData.supplierName,
          payment_method: purchaseData.paymentMethod,
          notes: purchaseData.notes,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newPurchase = transformPurchase(data);
      setPurchases(prev => [newPurchase, ...prev]);

      // Update product stock
      const productToUpdate = products.find(p => p.id === purchaseData.productId);
      if (productToUpdate) {
        const updatedProduct = {
          ...productToUpdate,
          currentStock: productToUpdate.currentStock + purchaseData.quantity,
        };
        await updateProduct(updatedProduct);
      }
    } catch (err) {
      console.error('Error adding purchase:', err);
      setError(err instanceof Error ? err.message : 'Failed to add purchase');
    }
  };

  // Helper methods
  const getLowStockProducts = () => {
    return products.filter(product => product.currentStock <= product.minStockLevel);
  };

  const getRecentPurchases = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return purchases.filter(purchase => new Date(purchase.date) >= cutoffDate);
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    products,
    suppliers,
    purchases,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchase,
    getLowStockProducts,
    getRecentPurchases,
    refreshData,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};