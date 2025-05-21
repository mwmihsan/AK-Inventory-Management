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
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [purchases, setPurchases] = useState<Purchase[]>(samplePurchases);

  // Local storage persistence
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedPurchases = localStorage.getItem('purchases');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }, [products, suppliers, purchases]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addSupplier = (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const addPurchase = (purchase: Purchase) => {
    setPurchases([...purchases, purchase]);
    
    // Update product quantity
    const productToUpdate = products.find(p => p.id === purchase.productId);
    if (productToUpdate) {
      const updatedProduct = {
        ...productToUpdate,
        currentStock: productToUpdate.currentStock + purchase.quantity
      };
      updateProduct(updatedProduct);
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.currentStock <= product.minStockLevel);
  };

  const getRecentPurchases = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return purchases.filter(purchase => new Date(purchase.date) >= cutoffDate);
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
    getRecentPurchases
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};