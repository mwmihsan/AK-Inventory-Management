import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Reports: React.FC = () => {
  const reportTypes = [
    {
      title: 'Inventory Status Report',
      description: 'Current stock levels, value, and low stock alerts',
      icon: <FileText size={40} className="text-blue-500" />,
    },
    {
      title: 'Purchase History Report',
      description: 'Purchase transactions with filtering by date, supplier, and product',
      icon: <FileText size={40} className="text-green-500" />,
    },
    {
      title: 'Supplier Performance Report',
      description: 'Supplier metrics including order frequency, value, and reliability',
      icon: <FileText size={40} className="text-purple-500" />,
    },
    {
      title: 'Inventory Valuation Report',
      description: 'Total value of inventory with breakdowns by category',
      icon: <FileText size={40} className="text-orange-500" />,
    },
    {
      title: 'Low Stock Report',
      description: 'Items below minimum stock threshold with reorder recommendations',
      icon: <FileText size={40} className="text-red-500" />,
    },
    {
      title: 'Stock Movement Report',
      description: 'Track inventory changes over time with inflow and outflow data',
      icon: <FileText size={40} className="text-indigo-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-start mb-4">
                <div className="bg-gray-50 p-3 rounded-lg mr-4">{report.icon}</div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex space-x-2">
                <Button variant="primary" icon={<Download size={16} />} size="sm">
                  Export
                </Button>
                <Button variant="outline" icon={<Printer size={16} />} size="sm">
                  Print
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;