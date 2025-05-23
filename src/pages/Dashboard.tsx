import React from 'react';
import InventorySummary from '../components/dashboard/InventorySummary';
import StockAlerts from '../components/dashboard/StockAlerts';
import RecentPurchases from '../components/dashboard/RecentPurchases';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Summary Cards - Responsive Grid */}
      <div className="w-full">
        <InventorySummary />
      </div>
      
      {/* Stock Alerts and Recent Purchases - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="w-full">
          <StockAlerts />
        </div>
        <div className="w-full">
          <RecentPurchases />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;