import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import { FiChevronDown, FiChevronRight, FiMail, FiPhone, FiCalendar, FiDollarSign, FiUsers, FiX, FiUser } from 'react-icons/fi';
import type { OrgChartNode, Employee } from '../types/index';

interface OrgChartNodeProps {
  node: OrgChartNode;
  level: number;
  expandAll: boolean;
  onViewDetails: (employeeId: string) => void;
}

const OrgChartNodeComponent: React.FC<OrgChartNodeProps> = ({ node, level, expandAll, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const marginLeft = level * 40;
  const hasChildren = node.children && node.children.length > 0;

  // Update expanded state when expandAll changes
  React.useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="my-2">
      <div className="bg-white shadow rounded-lg p-4 inline-block border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
           onClick={() => onViewDetails(node.id)}>
        <div className="flex items-center space-x-3">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-600 hover:text-gray-900 focus:outline-none transition-transform"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <FiChevronDown className="h-5 w-5" />
              ) : (
                <FiChevronRight className="h-5 w-5" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {node.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{node.name}</p>
            <p className="text-sm text-gray-600">{node.title}</p>
            {node.department && (
              <p className="text-xs text-gray-500">{node.department}</p>
            )}
            {hasChildren && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {node.children.length} {node.children.length === 1 ? 'direct report' : 'direct reports'}
              </p>
            )}
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children.map((child) => (
            <OrgChartNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expandAll={expandAll}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChart: React.FC = () => {
  const [expandAll, setExpandAll] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: orgChart, isLoading } = useQuery({
    queryKey: ['orgChart'],
    queryFn: () => employeeService.getOrgChart(),
  });

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: () => employeeService.getOne(selectedEmployeeId!),
    enabled: !!selectedEmployeeId,
  });

  const handleViewDetails = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const closeModal = () => {
    setSelectedEmployeeId(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Organizational Chart</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visual representation of your organization's reporting structure. Click on any card to view details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={() => setExpandAll(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiChevronDown className="h-4 w-4 mr-2" />
            Expand All
          </button>
          <button
            onClick={() => setExpandAll(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiChevronRight className="h-4 w-4 mr-2" />
            Collapse All
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
          {orgChart?.map((node) => (
            <OrgChartNodeComponent
              key={node.id}
              node={node}
              level={0}
              expandAll={expandAll}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmployeeId && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-lg text-gray-600">{selectedEmployee.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <FiMail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiPhone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiUser className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.department || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiCalendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hire Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedEmployee.manager && (
                  <div className="flex items-start space-x-3">
                    <FiUser className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reports To</p>
                      <p className="text-sm text-gray-900">
                        {selectedEmployee.manager.firstName} {selectedEmployee.manager.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEmployee.team && (
                  <div className="flex items-start space-x-3">
                    <FiUsers className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Team</p>
                      <p className="text-sm text-gray-900">{selectedEmployee.team.name}</p>
                    </div>
                  </div>
                )}

                {selectedEmployee.salary && (
                  <div className="flex items-start space-x-3">
                    <FiDollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Salary</p>
                      <p className="text-sm text-gray-900">
                        ${selectedEmployee.salary.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 mt-0.5 flex items-center justify-center">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        selectedEmployee.status === 'active'
                          ? 'bg-green-500'
                          : selectedEmployee.status === 'on_leave'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {selectedEmployee.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
