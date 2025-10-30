import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import { teamService } from '../services/team.service';
import { FiSearch, FiX, FiMail, FiPhone, FiCalendar, FiUser, FiUsers } from 'react-icons/fi';
import type { Employee, Team } from '../types/index';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

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
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow text-left cursor-pointer hover:ring-2 hover:ring-blue-500"
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
                  </button>
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
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow text-left cursor-pointer hover:ring-2 hover:ring-blue-500"
                  >
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {team.members?.length || 0} members
                    </p>
                  </button>
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

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedEmployee.title}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiMail className="text-gray-400" />
                    <span className="text-sm">{selectedEmployee.email}</span>
                  </div>
                  {selectedEmployee.phone && (
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FiPhone className="text-gray-400" />
                      <span className="text-sm">{selectedEmployee.phone}</span>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiCalendar className="text-gray-400" />
                    <span className="text-sm">
                      Hired: {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedEmployee.department && (
                    <div className="flex items-start space-x-2 text-gray-700">
                      <FiUser className="text-gray-400 mt-0.5" />
                      <span className="text-sm">Department: {selectedEmployee.department}</span>
                    </div>
                  )}

                  {selectedEmployee.manager && (
                    <div className="flex items-start space-x-2 text-gray-700">
                      <FiUser className="text-gray-400 mt-0.5" />
                      <span className="text-sm">
                        Reports to: {selectedEmployee.manager.firstName} {selectedEmployee.manager.lastName}
                      </span>
                    </div>
                  )}

                  {selectedEmployee.team && (
                    <div className="flex items-start space-x-2 text-gray-700">
                      <FiUsers className="text-gray-400 mt-0.5" />
                      <span className="text-sm">Team: {selectedEmployee.team.name}</span>
                    </div>
                  )}

                  {selectedEmployee.salary && (
                    <div className="flex items-start space-x-2 text-gray-700">
                      <span className="text-sm font-medium">Salary: ${selectedEmployee.salary.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Team Details</h2>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Team Name and Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h3>
                  {selectedTeam.description && (
                    <p className="mt-2 text-gray-600">{selectedTeam.description}</p>
                  )}
                </div>

                {/* Team Members */}
                {selectedTeam.members && selectedTeam.members.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      Team Members ({selectedTeam.members.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{member.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeam.members?.length === 0 && (
                  <div className="border-t pt-4">
                    <p className="text-gray-500 text-sm">No team members yet.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
