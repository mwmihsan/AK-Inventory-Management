import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const RecentPurchases: React.FC = () => {
  const { getRecentPurchases } = useInventory();
  
  const recentPurchases = getRecentPurchases(30); // Last 30 days
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: window.innerWidth < 640 ? undefined : 'numeric' // Hide year on mobile for space
    }).format(date);
  };
  
  return (
    <Card 
      title="Recent Purchases" 
      icon={<ShoppingBag size={18} className="text-blue-500" />}
      className="h-full"
    >
      {recentPurchases.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="mb-2">📦</div>
          <p className="text-sm sm:text-base">No recent purchases</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {recentPurchases.slice(0, 5).map(purchase => (
            <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 space-y-2 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{purchase.productName}</h4>
                <div className="flex flex-wrap items-center mt-1 gap-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {formatDate(purchase.date)}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <Badge variant="default" className="text-xs">
                    {purchase.supplierName}
                  </Badge>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  Rs {purchase.totalPrice.toFixed(2)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {purchase.quantity} {purchase.quantity === 1 ? 'unit' : 'units'}
                </div>
              </div>
            </div>
          ))}
          
          {/* Show "view all" hint on mobile if there are more purchases */}
          {recentPurchases.length > 5 && (
            <div className="sm:hidden pt-2 text-center">
              <p className="text-xs text-gray-500">
                +{recentPurchases.length - 5} more purchases
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RecentPurchases;