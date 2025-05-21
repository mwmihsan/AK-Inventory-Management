import React, { useState } from 'react';
import { Plus, Search, Calendar, CreditCard, ArrowUp, ArrowDown, Eye, FileText, Printer } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Purchase, Product, Supplier } from '../types';

const Purchases: React.FC = () => {
  const { purchases, products, suppliers, addPurchase } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Purchase>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [newPurchase, setNewPurchase] = useState<Partial<Purchase>>({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });
  
  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase => 
    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort purchases
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle sort change
  const handleSort = (field: keyof Purchase) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get payment method badge variant
  const getPaymentMethodVariant = (method: 'cash' | 'credit' | 'cheque') => {
    switch (method) {
      case 'cash': return 'success';
      case 'credit': return 'info';
      case 'cheque': return 'warning';
      default: return 'default';
    }
  };

  // Handle product selection
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewPurchase({
        ...newPurchase,
        productId,
        productName: product.name,
        unitPrice: product.unitPrice,
        totalPrice: product.unitPrice * (newPurchase.quantity || 0),
      });
    }
  };

  // Handle supplier selection
  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setNewPurchase({
        ...newPurchase,
        supplierId,
        supplierName: supplier.name,
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (quantity: number) => {
    setNewPurchase({
      ...newPurchase,
      quantity,
      totalPrice: (newPurchase.unitPrice || 0) * quantity,
    });
  };

  // Handle add purchase
  const handleAddPurchase = () => {
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      date: newPurchase.date || new Date().toISOString(),
      productId: newPurchase.productId || '',
      productName: newPurchase.productName || '',
      quantity: newPurchase.quantity || 0,
      unitPrice: newPurchase.unitPrice || 0,
      totalPrice: newPurchase.totalPrice || 0,
      supplierId: newPurchase.supplierId || '',
      supplierName: newPurchase.supplierName || '',
      paymentMethod: newPurchase.paymentMethod as 'cash' | 'credit' | 'cheque',
      notes: newPurchase.notes,
    };

    addPurchase(purchase);
    setNewPurchase({
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
    });
    setIsAddModalOpen(false);
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Handle export receipt
  const handleExportReceipt = () => {
    // Implementation for exporting receipt as PDF
    alert('Export functionality will be implemented with a PDF generation library');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          New Purchase
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
              placeholder="Search purchases..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={<Calendar size={16} />}
              className="lg:w-auto"
            >
              Date Range
            </Button>
            <Button 
              variant="outline" 
              icon={<CreditCard size={16} />}
              className="lg:w-auto"
            >
              Payment Method
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center">
                    Product
                    {sortField === 'productName' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('supplierName')}
                >
                  <div className="flex items-center">
                    Supplier
                    {sortField === 'supplierName' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                   
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Quantity
                    {sortField === 'quantity' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalPrice')}
                >
                  <div className="flex items-center">
                    Total
                    {sortField === 'totalPrice' && (
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
              {sortedPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(purchase.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{purchase.productName}</div>
                    <div className="text-xs text-gray-500">${purchase.unitPrice.toFixed(2)} per unit</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getPaymentMethodVariant(purchase.paymentMethod)}>
                      {purchase.paymentMethod.charAt(0).toUpperCase() + purchase.paymentMethod.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.quantity} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${purchase.totalPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      icon={<Eye size={14} />}
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setIsViewModalOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<FileText size={14} />}
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setIsReceiptModalOpen(true);
                      }}
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedPurchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No purchases found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </Card>

      {/* Add Purchase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Purchase"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={newPurchase.date}
              onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <select
              value={newPurchase.productId || ''}
              onChange={(e) => handleProductChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (${product.unitPrice.toFixed(2)} per {product.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              value={newPurchase.supplierId || ''}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={newPurchase.quantity || ''}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={newPurchase.paymentMethod}
                onChange={(e) => setNewPurchase({ ...newPurchase, paymentMethod: e.target.value as 'cash' | 'credit' | 'cheque' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <input
              type="number"
              value={newPurchase.totalPrice || ''}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newPurchase.notes || ''}
              onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddPurchase}
              disabled={!newPurchase.productId || !newPurchase.supplierId || !newPurchase.quantity}
            >
              Add Purchase
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Purchase Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPurchase(null);
        }}
        title="Purchase Details"
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date</h4>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPurchase.date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Product</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.productName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Supplier</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.supplierName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.quantity} units</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Unit Price</h4>
              <p className="mt-1 text-sm text-gray-900">${selectedPurchase.unitPrice.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Price</h4>
              <p className="mt-1 text-sm text-gray-900">${selectedPurchase.totalPrice.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
              <Badge variant={getPaymentMethodVariant(selectedPurchase.paymentMethod)}>
                {selectedPurchase.paymentMethod.charAt(0).toUpperCase() + selectedPurchase.paymentMethod.slice(1)}
              </Badge>
            </div>
            {selectedPurchase.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedPurchase.notes}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => {
                setIsViewModalOpen(false);
                setSelectedPurchase(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPurchase(null);
        }}
        title="Purchase Receipt"
        size="lg"
      >
        {selectedPurchase && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">SpiceTrack</h2>
              <p className="text-gray-500">Purchase Receipt</p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Receipt No.</h4>
                  <p className="text-sm text-gray-900">{selectedPurchase.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="text-sm text-gray-900">{formatDate(selectedPurchase.date)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Supplier</h4>
              <p className="text-sm text-gray-900">{selectedPurchase.supplierName}</p>
            </div>
            
            <table className="min-w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-500 pb-2">Product</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Quantity</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Unit Price</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 text-sm text-gray-900">{selectedPurchase.productName}</td>
                  <td className="py-2 text-sm text-gray-900 text-right">{selectedPurchase.quantity}</td>
                  <td className="py-2 text-sm text-gray-900 text-right">${selectedPurchase.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-sm text-gray-900 text-right">${selectedPurchase.totalPrice.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={3} className="py-2 text-sm font-medium text-gray-900 text-right">Total Amount:</td>
                  <td className="py-2 text-sm font-medium text-gray-900 text-right">${selectedPurchase.totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h4>
              <Badge variant={getPaymentMethodVariant(selectedPurchase.paymentMethod)}>
                {selectedPurchase.paymentMethod.charAt(0).toUpperCase() + selectedPurchase.paymentMethod.slice(1)}
              </Badge>
            </div>
            
            {selectedPurchase.notes && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <p className="text-sm text-gray-900">{selectedPurchase.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-8">
              <Button 
                variant="outline" 
                icon={<Printer size={16} />}
                onClick={handlePrintReceipt}
              >
                Print
              </Button>
              <Button 
                variant="outline"
                icon={<FileText size={16} />}
                onClick={handleExportReceipt}
              >
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsReceiptModalOpen(false);
                  setSelectedPurchase(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;