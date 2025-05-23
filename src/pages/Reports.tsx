import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Reports: React.FC = () => {
  const reportTypes = [
    {
      title: 'Inventory Status Report',
      description: 'Current stock levels, value, and low stock alerts',
      icon: <FileText size={32} className="text-blue-500 sm:w-10 sm:h-10" />,
      color: 'blue'
    },
    {
      title: 'Purchase History Report',
      description: 'Purchase transactions with filtering by date, supplier, and product',
      icon: <FileText size={32} className="text-green-500 sm:w-10 sm:h-10" />,
      color: 'green'
    },
    {
      title: 'Supplier Performance Report',
      description: 'Supplier metrics including order frequency, value, and reliability',
      icon: <FileText size={32} className="text-purple-500 sm:w-10 sm:h-10" />,
      color: 'purple'
    },
    {
      title: 'Inventory Valuation Report',
      description: 'Total value of inventory with breakdowns by category',
      icon: <FileText size={32} className="text-orange-500 sm:w-10 sm:h-10" />,
      color: 'orange'
    },
    {
      title: 'Low Stock Report',
      description: 'Items below minimum stock threshold with reorder recommendations',
      icon: <FileText size={32} className="text-red-500 sm:w-10 sm:h-10" />,
      color: 'red'
    },
    {
      title: 'Stock Movement Report',
      description: 'Track inventory changes over time with inflow and outflow data',
      icon: <FileText size={32} className="text-indigo-500 sm:w-10 sm:h-10" />,
      color: 'indigo'
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-100',
      green: 'bg-green-50 border-green-100',
      purple: 'bg-purple-50 border-purple-100',
      orange: 'bg-orange-50 border-orange-100',
      red: 'bg-red-50 border-red-100',
      indigo: 'bg-indigo-50 border-indigo-100',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 border-gray-100';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="h-full border-2 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0 ${getColorClasses(report.color)}`}>
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base sm:text-lg text-gray-900 leading-tight">
                    {report.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-auto">
                {/* Mobile: Stack buttons */}
                <div className="flex flex-col sm:hidden space-y-2">
                  <Button 
                    variant="primary" 
                    icon={<Download size={16} />} 
                    size="sm"
                    fullWidth
                  >
                    Export Report
                  </Button>
                  <Button 
                    variant="outline" 
                    icon={<Printer size={16} />} 
                    size="sm"
                    fullWidth
                  >
                    Print Report
                  </Button>
                </div>
                
                {/* Desktop: Side by side */}
                <div className="hidden sm:flex space-x-2">
                  <Button 
                    variant="primary" 
                    icon={<Download size={16} />} 
                    size="sm"
                    className="flex-1"
                  >
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    icon={<Printer size={16} />} 
                    size="sm"
                    className="flex-1"
                  >
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Mobile: Quick access section */}
      <div className="sm:hidden">
        <Card>
          <div className="text-center py-4">
            <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                icon={<FileText size={16} />}
              >
                Generate All Reports
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                icon={<Download size={16} />}
              >
                Export All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Desktop: Additional info */}
      <div className="hidden sm:block">
        <Card>
          <div className="text-center py-6">
            <h3 className="font-medium text-gray-900 mb-2">Report Generation</h3>
            <p className="text-sm text-gray-500 mb-4">
              All reports are generated in real-time based on your current inventory data.
              Export formats include PDF, Excel, and CSV.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                icon={<FileText size={16} />}
              >
                Schedule Reports
              </Button>
              <Button 
                variant="outline" 
                icon={<Download size={16} />}
              >
                Bulk Export
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;