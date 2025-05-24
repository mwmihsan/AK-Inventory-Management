import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUp, ArrowDown, Eye, Edit2, Package, TrendingUp, DollarSign } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { products, purchases, addProduct, updateProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPriceHistoryModalOpen, setIsPriceHistoryModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    unit: 'kg',
    currentStock: 0,
    minStockLevel: 0,
    leadTime: 7,
  });
  const [filters, setFilters] = useState({
    category: '',
    minStock: '',
    maxStock: '',
    minPrice: '',
    maxPrice: '',
  });

  // Calculate enhanced product data with purchase history and average pricing
  const enhancedProducts = useMemo(() => {
    return products.map(product => {
      // Get all purchases for this product
      const productPurchases = purchases.filter(p => p.productId === product.id);
      
      // Calculate total quantity purchased and weighted average price
      let totalQuantityPurchased = 0;
      let totalValue = 0;
      let priceHistory: Array<{date: string, quantity: number, unitPrice: number, supplier: string}> = [];
      
      productPurchases.forEach(purchase => {
        totalQuantityPurchased += purchase.quantity;
        totalValue += purchase.totalPrice;
        priceHistory.push({
          date: purchase.date,
          quantity: purchase.quantity,
          unitPrice: purchase.unitPrice,
          supplier: purchase.supplierName
        });
      });
      
      // Sort price history by date (newest first)
      priceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate average purchase price (weighted by quantity)
      const averagePurchasePrice = totalQuantityPurchased > 0 ? totalValue / totalQuantityPurchased : product.unitPrice;
      
      // Get latest purchase price
      const latestPurchasePrice = priceHistory.length > 0 ? priceHistory[0].unitPrice : product.unitPrice;
      
      // Calculate price trend (comparing latest vs previous)
      let priceTrend: 'up' | 'down' | 'stable' = 'stable';
      if (priceHistory.length >= 2) {
        const latest = priceHistory[0].unitPrice;
        const previous = priceHistory[1].unitPrice;
        if (latest > previous) priceTrend = 'up';
        else if (latest < previous) priceTrend = 'down';
      }
      
      // Calculate total inventory value based on current stock and average price
      const inventoryValue = product.currentStock * averagePurchasePrice;
      
      return {
        ...product,
        averagePurchasePrice,
        latestPurchasePrice,
        totalQuantityPurchased,
        priceHistory,
        priceTrend,
        inventoryValue,
        purchaseCount: productPurchases.length
      };
    });
  }, [products, purchases]);
  
  // Filter products based on search term and filters
  const filteredProducts = enhancedProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesMinStock = !filters.minStock || product.currentStock >= Number(filters.minStock);
    const matchesMaxStock = !filters.maxStock || product.currentStock <= Number(filters.maxStock);
    const matchesMinPrice = !filters.minPrice || product.averagePurchasePrice >= Number(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.averagePurchasePrice <= Number(filters.maxPrice);

    return matchesSearch && matchesCategory && matchesMinStock && matchesMaxStock && 
           matchesMinPrice && matchesMaxPrice;
  });
  
  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special handling for average price sorting
    if (sortField === 'unitPrice') {
      aValue = a.averagePurchasePrice;
      bValue = b.averagePurchasePrice;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle sort change
  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) return 'danger';
    if (product.currentStock <= product.minStockLevel) return 'warning';
    return 'success';
  };

  // Get price trend icon
  const getPriceTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={14} className="text-red-500" />;
    if (trend === 'down') return <TrendingUp size={14} className="text-green-500 rotate-180" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
  };

  const handleAddProduct = () => {
    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name || '',
      barcode: newProduct.barcode,
      category: newProduct.category || '',
      unit: newProduct.unit || 'kg',
      unitPrice: Number(newProduct.unitPrice) || 0,
      currentStock: Number(newProduct.currentStock) || 0,
      minStockLevel: Number(newProduct.minStockLevel) || 0,
      leadTime: Number(newProduct.leadTime) || 7,
      notes: newProduct.notes,
      addedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    addProduct(product);
    setNewProduct({
      unit: 'kg',
      currentStock: 0,
      minStockLevel: 0,
      leadTime: 7,
    });
    setIsAddModalOpen(false);
  };

  const handleEditProduct = () => {
    if (selectedProduct && newProduct) {
      const updatedProduct: Product = {
        ...selectedProduct,
        ...newProduct,
        lastUpdated: new Date().toISOString(),
      };
      updateProduct(updatedProduct);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setNewProduct({
        unit: 'kg',
        currentStock: 0,
        minStockLevel: 0,
        leadTime: 7,
      });
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct(product);
    setIsEditModalOpen(true);
  };

  const openViewModal = (product: any) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const openPriceHistoryModal = (product: any) => {
    setSelectedProduct(product);
    setIsPriceHistoryModalOpen(true);
  };

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minStock: '',
      maxStock: '',
      minPrice: '',
      maxPrice: '',
    });
    setIsFilterModalOpen(false);
  };

  // Mobile Card View Component
  const MobileProductCard = ({ product }: { product: any }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          {product.barcode && (
            <p className="text-xs text-gray-500 mt-1">SKU: {product.barcode}</p>
          )}
        </div>
        <Badge variant="default" className="ml-2 flex-shrink-0">
          {product.category}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Stock:</span>
          <div className="mt-1">
            <Badge variant={getStockStatus(product)}>
              {product.currentStock} {product.unit}
            </Badge>
          </div>
        </div>
        <div>
          <span className="text-gray-500">Avg Price:</span>
          <div className="flex items-center mt-1">
            <p className="font-medium">Rs {product.averagePurchasePrice.toFixed(2)}</p>
            {product.purchaseCount > 0 && (
              <span className="ml-1">{getPriceTrendIcon(product.priceTrend)}</span>
            )}
          </div>
        </div>
      </div>

      {product.purchaseCount > 0 && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {product.purchaseCount} purchases • Total: {product.totalQuantityPurchased} {product.unit}
        </div>
      )}
      
      {product.currentStock <= product.minStockLevel && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Min level: {product.minStockLevel} {product.unit}
        </div>
      )}
      
      <div className="flex space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          icon={<Eye size={14} />}
          onClick={() => openViewModal(product)}
          className="flex-1"
        >
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          icon={<DollarSign size={14} />}
          onClick={() => openPriceHistoryModal(product)}
          className="flex-1"
        >
          Prices
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          icon={<Edit2 size={14} />}
          onClick={() => openEditModal(product)}
          className="flex-1"
        >
          Edit
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Add New Product
        </Button>
      </div>
      
      <Card>
        {/* Search and Filter Bar */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={Object.values(filters).some(f => f) ? "primary" : "outline"}
            icon={<Filter size={16} />}
            className="w-full sm:w-auto"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
            {Object.values(filters).some(f => f) && (
              <span className="ml-1 bg-white bg-opacity-20 text-xs px-1.5 py-0.5 rounded">
                {Object.values(filters).filter(f => f).length}
              </span>
            )}
          </Button>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('currentStock')}
                >
                  <div className="flex items-center">
                    Stock
                    {sortField === 'currentStock' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('unitPrice')}
                >
                  <div className="flex items-center">
                    Avg Price
                    {sortField === 'unitPrice' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.barcode && (
                      <div className="text-xs text-gray-500">SKU: {product.barcode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="default">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Badge variant={getStockStatus(product)}>
                        {product.currentStock} {product.unit}
                      </Badge>
                      {product.currentStock <= product.minStockLevel && (
                        <span className="ml-2 text-xs text-gray-500">
                          Min: {product.minStockLevel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Rs {product.averagePurchasePrice.toFixed(2)}
                        </div>
                        {product.purchaseCount > 0 && product.latestPurchasePrice !== product.averagePurchasePrice && (
                          <div className="text-xs text-gray-500">
                            Latest: Rs {product.latestPurchasePrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {product.purchaseCount > 0 && (
                        <span className="ml-2">{getPriceTrendIcon(product.priceTrend)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.purchaseCount > 0 ? (
                      <div className="text-xs">
                        <div className="text-gray-900">{product.purchaseCount} purchases</div>
                        <div className="text-gray-500">Total: {product.totalQuantityPurchased} {product.unit}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No purchases</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rs {product.inventoryValue.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      icon={<Eye size={14} />}
                      onClick={() => openViewModal(product)}
                    >
                      View
                    </Button>
                    {product.purchaseCount > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        icon={<DollarSign size={14} />}
                        onClick={() => openPriceHistoryModal(product)}
                      >
                        Prices
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<Edit2 size={14} />}
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Desktop Empty State */}
        {sortedProducts.length === 0 && (
          <div className="hidden lg:block text-center py-8 text-gray-500">
            No products found. Try adjusting your search or filters.
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newProduct.name || ''}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input
              type="text"
              value={newProduct.barcode || ''}
              onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={newProduct.category || ''}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value as Product['unit'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="piece">Piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Price (Rs)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.unitPrice || ''}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Reference only. Actual prices tracked from purchases.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input
                type="number"
                min="0"
                value={newProduct.currentStock}
                onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
              <input
                type="number"
                min="0"
                value={newProduct.minStockLevel}
                onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lead Time (days)</label>
            <input
              type="number"
              min="0"
              value={newProduct.leadTime}
              onChange={(e) => setNewProduct({ ...newProduct, leadTime: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newProduct.notes || ''}
              onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                setNewProduct({
                  unit: 'kg',
                  currentStock: 0,
                  minStockLevel: 0,
                  leadTime: 7,
                });
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditProduct} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Product Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Barcode</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.barcode || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Unit</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.unit}</p>
            </div>
            
            {/* Enhanced pricing information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Average Purchase Price</span>
                  <p className="text-lg font-semibold text-blue-600">
                    Rs {(selectedProduct as any).averagePurchasePrice.toFixed(2)}
                  </p>
                </div>
                {(selectedProduct as any).purchaseCount > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Latest Purchase Price</span>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold text-gray-700">
                        Rs {(selectedProduct as any).latestPurchasePrice.toFixed(2)}
                      </p>
                      <span className="ml-2">{getPriceTrendIcon((selectedProduct as any).priceTrend)}</span>
                    </div>
                  </div>
                )}
              </div>
              {(selectedProduct as any).purchaseCount > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-gray-600">
                    Based on {(selectedProduct as any).purchaseCount} purchases • 
                    Total purchased: {(selectedProduct as any).totalQuantityPurchased} {selectedProduct.unit}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Current Stock</h4>
              <div className="mt-1">
                <Badge variant={getStockStatus(selectedProduct)}>
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Minimum Stock Level</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.minStockLevel} {selectedProduct.unit}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Inventory Value</h4>
              <p className="mt-1 text-lg font-semibold text-green-600">
                Rs {(selectedProduct as any).inventoryValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {selectedProduct.currentStock} {selectedProduct.unit} × Rs {(selectedProduct as any).averagePurchasePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Lead Time</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.leadTime} days</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedProduct.notes || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Added Date</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedProduct.addedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedProduct.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Price History Modal */}
      <Modal
        isOpen={isPriceHistoryModalOpen}
        onClose={() => {
          setIsPriceHistoryModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Price History"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{selectedProduct.name}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Average Price</span>
                  <p className="font-semibold text-blue-600">
                    Rs {(selectedProduct as any).averagePurchasePrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total Purchases</span>
                  <p className="font-semibold">{(selectedProduct as any).purchaseCount}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Quantity</span>
                  <p className="font-semibold">
                    {(selectedProduct as any).totalQuantityPurchased} {selectedProduct.unit}
                  </p>
                </div>
              </div>
            </div>

            {(selectedProduct as any).priceHistory.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Purchase History</h4>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedProduct as any).priceHistory.map((entry: any, index: number) => {
                        const previousPrice = index < (selectedProduct as any).priceHistory.length - 1 
                          ? (selectedProduct as any).priceHistory[index + 1].unitPrice 
                          : null;
                        const priceChange = previousPrice ? entry.unitPrice - previousPrice : 0;
                        const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;

                        return (
                          <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(entry.date).toLocaleDateString()}
                              {index === 0 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Latest
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.supplier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.quantity} {selectedProduct.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Rs {entry.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {previousPrice ? (
                                <div className={`flex items-center ${
                                  priceChange > 0 ? 'text-red-600' : priceChange < 0 ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {priceChange > 0 ? '+' : ''}Rs {priceChange.toFixed(2)}
                                  <span className="ml-1 text-xs">
                                    ({priceChange > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">First purchase</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <p>No purchase history available</p>
                <p className="text-sm">Purchase this product to track price history</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsPriceHistoryModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Products"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Stock</label>
              <input
                type="number"
                min="0"
                value={filters.minStock}
                onChange={(e) => setFilters({ ...filters, minStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Stock</label>
              <input
                type="number"
                min="0"
                value={filters.maxStock}
                onChange={(e) => setFilters({ ...filters, maxStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Avg Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Avg Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button variant="primary" onClick={handleApplyFilters} className="w-full sm:w-auto">
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory; 