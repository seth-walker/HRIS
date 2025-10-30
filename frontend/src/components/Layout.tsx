import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiGrid, FiLogOut, FiSearch, FiFileText, FiDownload, FiClock } from 'react-icons/fi';
import { RoleName } from '../types/index';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canAccessAdminFeatures = user?.role.name === RoleName.ADMIN || user?.role.name === RoleName.HR;

  const navItems = [
    { path: '/search', label: 'Search', icon: FiSearch },
    { path: '/employees', label: 'Employees', icon: FiUsers },
    { path: '/teams', label: 'Teams', icon: FiGrid },
    { path: '/org-chart', label: 'Org Chart', icon: FiFileText },
    ...(canAccessAdminFeatures ? [{ path: '/import-export', label: 'Import/Export', icon: FiDownload }] : []),
    ...(canAccessAdminFeatures ? [{ path: '/audit-logs', label: 'Audit Logs', icon: FiClock }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">HRIS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user?.email} ({user?.role.name})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
