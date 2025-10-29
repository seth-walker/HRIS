import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { FiUsers } from 'react-icons/fi';

const Teams: React.FC = () => {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAll(),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all teams in your organization.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => (
            <div
              key={team.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                <FiUsers className="h-5 w-5 text-gray-400" />
              </div>
              {team.description && (
                <p className="mt-2 text-sm text-gray-600">{team.description}</p>
              )}
              {team.lead && (
                <div className="mt-4 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {team.lead.firstName.charAt(0)}{team.lead.lastName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {team.lead.firstName} {team.lead.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Team Lead</p>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{team.members?.length || 0}</span> members
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
