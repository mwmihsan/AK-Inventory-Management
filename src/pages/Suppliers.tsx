import React, { useState } from 'react';
import { Plus, Search, ArrowUp, ArrowDown, Phone, Mail, Eye, Edit2, Trash2, Users } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Supplier>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle sort change
  const handleSort = (field: keyof Supplier) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddSupplier = () => {
    const supplier: Supplier = {
      id: crypto.randomUUID(),
      name: newSupplier.name || '',
      contactPerson: newSupplier.contactPerson,
      email: newSupplier.email,
      phone: newSupplier.phone || '',
      address: newSupplier.address,
      notes: newSupplier.notes,
      addedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    addSupplier(supplier);
    setNewSupplier({});
    setIsAddModalOpen(false);
  };

  const handleEditSupplier = () => {
    if (selectedSupplier) {
      const updatedSupplier: Supplier = {
        ...selectedSupplier,
        ...newSupplier,
        lastUpdated: new Date().toISOString(),
      };
      updateSupplier(updatedSupplier);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      setNewSupplier({});
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // Mobile Card View Component
  const MobileSupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{supplier.name}</h3>
          {supplier.contactPerson && (
            <p className="text-sm text-gray-600 mt-1 truncate">{supplier.contactPerson}</p>
          )}
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
          {new Date(supplier.addedDate).toLocaleDateString()}
        </div>
      </div>
      
      <div className="space-y-2">
        {supplier.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate">{supplier.phone}</span>
          </div>
        )}
        {supplier.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate">{supplier.email}</span>
          </div>
        )}
        {supplier.address && (
          <p className="text-sm text-gray-600 line-clamp-2">{supplier.address}</p>
        )}
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          icon={<Eye size={14} />}
          onClick={() => openViewModal(supplier)}
          className="flex-1"
        >
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          icon={<Edit2 size={14} />}
          onClick={() => openEditModal(supplier)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => handleDeleteSupplier(supplier.id)}
          className="flex-shrink-0"
        >
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Suppliers</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Add New Supplier
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
              placeholder="Search suppliers..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                    Supplier Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('contactPerson')}
                >
                  <div className="flex items-center">
                    Contact Person
                    {sortField === 'contactPerson' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-xs text-gray-500">Added: {new Date(supplier.addedDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.contactPerson || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={14} className="mr-1" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail size={14} className="mr-1" />
                          {supplier.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {supplier.address || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      icon={<Eye size={14} />}
                      onClick={() => openViewModal(supplier)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mr-2"
                      icon={<Edit2 size={14} />}
                      onClick={() => openEditModal(supplier)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {sortedSuppliers.length > 0 ? (
            sortedSuppliers.map((supplier) => (
              <MobileSupplierCard key={supplier.id} supplier={supplier} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No suppliers found</p>
              <p className="text-sm">Try adjusting your search</p>
            </div>
          )}
        </div>

        {/* Desktop Empty State */}
        {sortedSuppliers.length === 0 && (
          <div className="hidden lg:block text-center py-8 text-gray-500">
            No suppliers found. Try adjusting your search.
          </div>
        )}
      </Card>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Supplier"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newSupplier.name || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input
              type="text"
              value={newSupplier.contactPerson || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newSupplier.email || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={newSupplier.phone || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={newSupplier.address || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newSupplier.notes || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSupplier} className="w-full sm:w-auto">
              Add Supplier
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
          setNewSupplier({});
        }}
        title="Edit Supplier"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newSupplier.name || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input
              type="text"
              value={newSupplier.contactPerson || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newSupplier.email || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={newSupplier.phone || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={newSupplier.address || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newSupplier.notes || ''}
              onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedSupplier(null);
                setNewSupplier({});
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSupplier} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Supplier Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSupplier(null);
        }}
        title="Supplier Details"
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.contactPerson || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Email</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.email || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phone</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.address || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <p className="mt-1 text-sm text-gray-900">{selectedSupplier.notes || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Added Date</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedSupplier.addedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedSupplier.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedSupplier(null);
                }}
                className="w-full sm:w-auto"
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

export default Suppliers;