import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Supplier, Purchase } from '../types';
import { sampleProducts, sampleSuppliers, samplePurchases } from '../data/sampleData';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addPurchase: (purchase: Purchase) => void;
  getLowStockProducts: () => Product[];
  getRecentPurchases: (days: number) => Purchase[];
  error: string | null;
  clearError: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Safe localStorage operations with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${error}`);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${error}`);
      return false;
    }
  }
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [purchases, setPurchases] = useState<Purchase[]>(samplePurchases);
  const [error, setError] = useState<string | null>(null);

  // Local storage persistence with error handling
  useEffect(() => {
    try {
      const savedProducts = safeLocalStorage.getItem('products');
      const savedSuppliers = safeLocalStorage.getItem('suppliers');
      const savedPurchases = safeLocalStorage.getItem('purchases');

      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts);
      }
      if (savedSuppliers) {
        const parsedSuppliers = JSON.parse(savedSuppliers);
        setSuppliers(parsedSuppliers);
      }
      if (savedPurchases) {
        const parsedPurchases = JSON.parse(savedPurchases);
        setPurchases(parsedPurchases);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setError('Failed to load saved data. Using default data.');
    }
  }, []);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('products', JSON.stringify(products));
      safeLocalStorage.setItem('suppliers', JSON.stringify(suppliers));
      safeLocalStorage.setItem('purchases', JSON.stringify(purchases));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      setError('Failed to save data. Changes may be lost on page refresh.');
    }
  }, [products, suppliers, purchases]);

  const clearError = () => setError(null);

  const addProduct = (product: Product) => {
    try {
      setProducts(prev => [...prev, product]);
      clearError();
    } catch (error) {
      setError('Failed to add product');
    }
  };

  const updateProduct = (product: Product) => {
    try {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      clearError();
    } catch (error) {
      setError('Failed to update product');
    }
  };

  const deleteProduct = (id: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== id));
      clearError();
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const addSupplier = (supplier: Supplier) => {
    try {
      setSuppliers(prev => [...prev, supplier]);
      clearError();
    } catch (error) {
      setError('Failed to add supplier');
    }
  };

  const updateSupplier = (supplier: Supplier) => {
    try {
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
      clearError();
    } catch (error) {
      setError('Failed to update supplier');
    }
  };

  const deleteSupplier = (id: string) => {
    try {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      clearError();
    } catch (error) {
      setError('Failed to delete supplier');
    }
  };

  const addPurchase = (purchase: Purchase) => {
    try {
      setPurchases(prev => [...prev, purchase]);
      
      // Update product quantity
      const productToUpdate = products.find(p => p.id === purchase.productId);
      if (productToUpdate) {
        const updatedProduct = {
          ...productToUpdate,
          currentStock: productToUpdate.currentStock + purchase.quantity,
          lastUpdated: new Date().toISOString()
        };
        updateProduct(updatedProduct);
      }
      clearError();
    } catch (error) {
      setError('Failed to add purchase');
    }
  };

  const getLowStockProducts = (): Product[] => {
    try {
      return products.filter(product => product.currentStock <= product.minStockLevel);
    } catch (error) {
      setError('Failed to get low stock products');
      return [];
    }
  };

  const getRecentPurchases = (days: number): Purchase[] => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return purchases.filter(purchase => new Date(purchase.date) >= cutoffDate);
    } catch (error) {
      setError('Failed to get recent purchases');
      return [];
    }
  };

  const value = {
    products,
    suppliers,
    purchases,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchase,
    getLowStockProducts,
    getRecentPurchases,
    error,
    clearError
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};