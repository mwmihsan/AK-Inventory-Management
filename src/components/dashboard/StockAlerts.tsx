import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Product } from '../../types';

const StockAlerts: React.FC = () => {
  const { products } = useInventory();
  
  const getLowStockProducts = (): Product[] => {
    return products.filter(product => product.currentStock <= product.minStockLevel);
  };

  const getStockStatus = (product: Product): 'critical' | 'low' | 'reorder' => {
    const ratio = product.currentStock / product.minStockLevel;
    if (ratio === 0) return 'critical';
    if (ratio < 0.5) return 'low';
    return 'reorder';
  };
  
  const lowStockProducts = getLowStockProducts();
  
  return (
    <Card 
      title="Stock Alerts" 
      icon={<AlertTriangle size={18} className="text-amber-500" />}
      className="h-full"
    >
      {lowStockProducts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="mb-2">✅</div>
          <p className="text-sm sm:text-base">All stock levels are good!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {lowStockProducts.map(product => {
            const status = getStockStatus(product);
            
            return (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 last:border-0 space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{product.name}</h4>
                  <div className="flex flex-wrap items-center mt-1 gap-2">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Stock: {product.currentStock} {product.unit}
                    </span>
                    <Badge 
                      variant={status === 'critical' ? 'danger' : status === 'low' ? 'warning' : 'info'}
                      className="text-xs"
                    >
                      {status === 'critical' ? 'Critical' : status === 'low' ? 'Low Stock' : 'Reorder'}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 flex-shrink-0">
                  Min: {product.minStockLevel} {product.unit}
                </div>
              </div>
            );
          })}
          
          {/* Show summary on mobile if many items */}
          {lowStockProducts.length > 3 && (
            <div className="sm:hidden pt-2 text-center">
              <p className="text-xs text-gray-500">
                {lowStockProducts.length} items need attention
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default StockAlerts;