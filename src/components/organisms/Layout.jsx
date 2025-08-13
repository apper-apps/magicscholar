import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import MobileSidebar from '@/components/organisms/MobileSidebar';
import Sidebar from '@/components/organisms/Sidebar';
import Button from '@/components/atoms/Button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  return (
    <div className="h-screen flex overflow-hidden bg-background-50">
      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
          {/* Mobile menu button */}
          <button
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </button>
          
          {/* Header content */}
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">Scholar Hub</h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <ApperIcon name="Bell" className="h-6 w-6" />
                <span className="sr-only">View notifications</span>
              </button>

              {/* Logout button */}
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
                className="ml-3"
              >
                <ApperIcon name="LogOut" className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;