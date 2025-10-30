import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { employeeService } from '../services/employee.service';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiX, FiUserPlus } from 'react-icons/fi';
import type { Team, Employee, RoleName } from '../types/index.js';

const Teams: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadId: '',
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAll(),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Team>) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      teamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
      closeManageMembersModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const assignEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, teamId }: { employeeId: string; teamId: string | null }) =>
      employeeService.update(employeeId, { teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const canManageTeams =
    user?.role.name === ('admin' as RoleName) || user?.role.name === ('hr' as RoleName);

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      leadId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      leadId: team.leadId || '',
    });
    setIsModalOpen(true);
  };

  const openManageMembersModal = (team: Team) => {
    setSelectedTeam(team);
    setIsManageMembersOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const closeManageMembersModal = () => {
    setIsManageMembersOpen(false);
    setSelectedTeam(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      leadId: formData.leadId || undefined,
    };

    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignEmployee = (employeeId: string, teamId: string) => {
    assignEmployeeMutation.mutate({ employeeId, teamId });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    assignEmployeeMutation.mutate({ employeeId, teamId: null });
  };

  const getTeamMembers = (teamId: string) => {
    return employees?.filter((emp) => emp.teamId === teamId) || [];
  };

  const getAvailableEmployees = () => {
    return employees?.filter((emp) => !emp.teamId) || [];
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage teams, assign team leads, and add team members.
          </p>
        </div>
        {canManageTeams && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2" />
              Create Team
            </button>
          </div>
        )}
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
                    {team.lead.firstName.charAt(0)}
                    {team.lead.lastName.charAt(0)}
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
              {canManageTeams && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => openManageMembersModal(team)}
                    className="w-full inline-flex justify-center items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                  >
                    <FiUserPlus className="mr-1" />
                    Manage Members
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(team)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiEdit2 className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <FiTrash2 className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTeam ? 'Edit Team' : 'Create Team'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Team Lead
                  </label>
                  <select
                    value={formData.leadId}
                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">No Team Lead</option>
                    {employees?.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingTeam
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isManageMembersOpen && selectedTeam && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Team Members
                </h3>
                <p className="text-sm text-gray-500">{selectedTeam.name}</p>
              </div>
              <button
                onClick={closeManageMembersModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4">
              {/* Current Members */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Current Members ({getTeamMembers(selectedTeam.id).length})
                </h4>
                {getTeamMembers(selectedTeam.id).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No members assigned</p>
                ) : (
                  <div className="space-y-2">
                    {getTeamMembers(selectedTeam.id).map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                            {emp.firstName.charAt(0)}
                            {emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{emp.title}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEmployee(emp.id)}
                          disabled={assignEmployeeMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Employees */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Available Employees ({getAvailableEmployees().length})
                </h4>
                {getAvailableEmployees().length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No unassigned employees available
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getAvailableEmployees().map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                            {emp.firstName.charAt(0)}
                            {emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{emp.title}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignEmployee(emp.id, selectedTeam.id)}
                          disabled={assignEmployeeMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeManageMembersModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
