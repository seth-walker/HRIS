import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employee.service';
import type { OrgChartNode } from '../types/index';

const OrgChartNodeComponent: React.FC<{ node: OrgChartNode; level: number }> = ({ node, level }) => {
  const marginLeft = level * 40;

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="my-2">
      <div className="bg-white shadow rounded-lg p-4 inline-block border-l-4 border-blue-500">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {node.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{node.name}</p>
            <p className="text-sm text-gray-600">{node.title}</p>
            {node.department && (
              <p className="text-xs text-gray-500">{node.department}</p>
            )}
          </div>
        </div>
      </div>
      {node.children.map((child) => (
        <OrgChartNodeComponent key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
};

const OrgChart: React.FC = () => {
  const { data: orgChart, isLoading } = useQuery({
    queryKey: ['orgChart'],
    queryFn: () => employeeService.getOrgChart(),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Organizational Chart</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visual representation of your organization's reporting structure.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
          {orgChart?.map((node) => (
            <OrgChartNodeComponent key={node.id} node={node} level={0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChart;
