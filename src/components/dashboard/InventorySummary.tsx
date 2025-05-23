import React from 'react';
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import Card from '../ui/Card';

const InventorySummary: React.FC = () => {
  const { products, purchases } = useInventory();
  
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
      value: totalProducts,
      icon: <Package size={20} className="text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Inventory Value',
      value: `Rs ${totalInventoryValue.toFixed(2)}`,
      icon: <DollarSign size={20} className="text-green-500" />,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems,
      icon: <TrendingDown size={20} className="text-red-500" />,
      bgColor: 'bg-red-50'
    },
    {
      title: 'Purchases This Month',
      value: `Rs ${totalPurchasesThisMonth.toFixed(2)}`,
      icon: <TrendingUp size={20} className="text-amber-500" />,
      bgColor: 'bg-amber-50'
    },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className="h-full">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                {item.title}
              </p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 mt-1 truncate" title={item.value.toString()}>
                {item.value}
              </p>
            </div>
            <div className={`${item.bgColor} p-2 sm:p-3 rounded-full flex-shrink-0 ml-2`}>
              {item.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InventorySummary;