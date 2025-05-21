import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUp, ArrowDown, Eye, Edit2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
  
  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesMinStock = !filters.minStock || product.currentStock >= Number(filters.minStock);
    const matchesMaxStock = !filters.maxStock || product.currentStock <= Number(filters.maxStock);
    const matchesMinPrice = !filters.minPrice || product.unitPrice >= Number(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || product.unitPrice <= Number(filters.maxPrice);

    return matchesSearch && matchesCategory && matchesMinStock && matchesMaxStock && 
           matchesMinPrice && matchesMaxPrice;
  });
  
  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
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

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Product
        </Button>
      </div>
      
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            icon={<Filter size={16} />}
            className="lg:w-auto"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto">
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
                    Unit Price
                    {sortField === 'unitPrice' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.unitPrice.toFixed(2)} / {product.unit}
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
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Try adjusting your search or filters.
            </div>
          )}
        </div>
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.unitPrice || ''}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddProduct}>
              Add Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
          setNewProduct({
            unit: 'kg',
            currentStock: 0,
            minStockLevel: 0,
            leadTime: 7,
          });
        }}
        title="Edit Product"
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.unitPrice || ''}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex justify-end space-x-3 mt-6">
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
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditProduct}>
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
            <div>
              <h4 className="text-sm font-medium text-gray-500">Unit Price</h4>
              <p className="mt-1 text-sm text-gray-900">${selectedProduct.unitPrice.toFixed(2)}</p>
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Price</label>
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
              <label className="block text-sm font-medium text-gray-700">Max Price</label>
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
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;