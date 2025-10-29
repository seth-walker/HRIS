import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import { FiMail, FiPhone, FiUser } from 'react-icons/fi';

const Employees: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => employeeService.getAll({ search }),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all employees including their name, title, department, and contact information.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
        />
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {employees?.map((employee) => (
            <div
              key={employee.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{employee.title}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {employee.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="mr-2" />
                    {employee.department}
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMail className="mr-2" />
                    {employee.email}
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="mr-2" />
                    {employee.phone}
                  </div>
                )}
              </div>
              {employee.manager && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Reports to: <span className="font-medium text-gray-700">
                      {employee.manager.firstName} {employee.manager.lastName}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Employees;
