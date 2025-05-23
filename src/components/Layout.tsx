import React, { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  LogOut,
  Spade
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { path: '/purchases', icon: <ShoppingCart size={20} />, label: 'Purchases' },
    { path: '/suppliers', icon: <Users size={20} />, label: 'Suppliers' },
    { path: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isSidebarOpen && sidebar && !sidebar.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            id="mobile-menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <Spade size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">SpiceTrack</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <div 
        id="mobile-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Desktop header */}
        <div className="hidden lg:flex items-center h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Spade size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">SpiceTrack</h1>
          </div>
        </div>

        {/* Mobile header in sidebar */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Spade size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">SpiceTrack</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-3 rounded-md transition-colors text-sm font-medium
                ${location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
            <LogOut size={18} className="mr-2" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile spacing for fixed header */}
        <div className="lg:hidden h-16" />
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;