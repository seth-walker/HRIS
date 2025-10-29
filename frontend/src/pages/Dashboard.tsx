import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiGrid, FiTrendingUp } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Employees', value: '45', icon: FiUsers, color: 'bg-blue-500' },
    { label: 'Active Teams', value: '8', icon: FiGrid, color: 'bg-green-500' },
    { label: 'Growth Rate', value: '12%', icon: FiTrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.email}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your role: <span className="font-semibold">{user?.role.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/employees"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900">View Employees</h3>
            <p className="mt-1 text-sm text-gray-500">Browse employee directory</p>
          </a>
          <a
            href="/teams"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900">Manage Teams</h3>
            <p className="mt-1 text-sm text-gray-500">View and edit teams</p>
          </a>
          <a
            href="/org-chart"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900">Org Chart</h3>
            <p className="mt-1 text-sm text-gray-500">Visualize organization</p>
          </a>
          <a
            href="/search"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900">Search</h3>
            <p className="mt-1 text-sm text-gray-500">Find employees and teams</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
