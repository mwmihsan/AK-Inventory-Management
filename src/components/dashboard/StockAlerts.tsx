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
          All stock levels are good!
        </div>
      ) : (
        <div className="space-y-4">
          {lowStockProducts.map(product => {
            const status = getStockStatus(product);
            
            return (
              <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 mr-2">
                      Stock: {product.currentStock} {product.unit}
                    </span>
                    <Badge 
                      variant={status === 'critical' ? 'danger' : status === 'low' ? 'warning' : 'info'}
                    >
                      {status === 'critical' ? 'Critical' : status === 'low' ? 'Low Stock' : 'Reorder'}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  Min: {product.minStockLevel} {product.unit}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default StockAlerts;