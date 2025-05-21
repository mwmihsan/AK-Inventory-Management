import React from 'react';
import InventorySummary from '../components/dashboard/InventorySummary';
import StockAlerts from '../components/dashboard/StockAlerts';
import RecentPurchases from '../components/dashboard/RecentPurchases';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <InventorySummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockAlerts />
        <RecentPurchases />
      </div>
    </div>
  );
};

export default Dashboard;