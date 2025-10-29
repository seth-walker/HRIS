import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import { teamService } from '../services/team.service';
import { FiSearch } from 'react-icons/fi';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees', query],
    queryFn: () => employeeService.getAll({ search: query }),
    enabled: query.length > 0,
  });

  const { data: teams } = useQuery({
    queryKey: ['teams', query],
    queryFn: () => teamService.getAll(query),
    enabled: query.length > 0,
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Global Search</h1>
          <p className="mt-2 text-sm text-gray-700">
            Search across employees and teams.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search employees and teams..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {query.length > 0 && (
        <div className="mt-8 space-y-8">
          {/* Employees Results */}
          {employees && employees.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Employees ({employees.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{employee.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {teams && teams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Teams ({teams.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {team.members?.length || 0} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {employees?.length === 0 && teams?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
