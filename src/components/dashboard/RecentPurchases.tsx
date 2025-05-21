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
      year: 'numeric'
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
          No recent purchases
        </div>
      ) : (
        <div className="space-y-4">
          {recentPurchases.slice(0, 5).map(purchase => (
            <div key={purchase.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <h4 className="font-medium text-gray-800">{purchase.productName}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {formatDate(purchase.date)}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <Badge variant="default">
                    {purchase.supplierName}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  Rs {purchase.totalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {purchase.quantity} {purchase.quantity === 1 ? 'unit' : 'units'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentPurchases;