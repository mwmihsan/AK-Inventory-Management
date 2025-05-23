import React from 'react';
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useCurrency } from '../../utils/currency';
import Card from '../ui/Card';

const InventorySummary: React.FC = () => {
  const { products, purchases } = useInventory();
  const { formatCurrency } = useCurrency();
  
  // Calculate total inventory value
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.currentStock * product.unitPrice);
  }, 0);
  
  // Get total number of products
  const totalProducts = products.length;
  
  // Calculate low stock items
  const lowStockItems = products.filter(
    product => product.currentStock <= product.minStockLevel
  ).length;
  
  // Calculate total purchases this month
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  
  const totalPurchasesThisMonth = purchases
    .filter(purchase => new Date(purchase.date) >= firstDayOfMonth)
    .reduce((total, purchase) => total + purchase.totalPrice, 0);
  
  const summaryItems = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: <Package size={20} className="text-blue-500" />,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(totalInventoryValue),
      icon: <DollarSign size={20} className="text-green-500" />,
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      icon: <TrendingDown size={20} className="text-red-500" />,
    },
    {
      title: 'Purchases This Month',
      value: formatCurrency(totalPurchasesThisMonth),
      icon: <TrendingUp size={20} className="text-amber-500" />,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className="h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-full">
              {item.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InventorySummary;