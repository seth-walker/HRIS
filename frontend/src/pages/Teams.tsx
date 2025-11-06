import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { employeeService } from '../services/employee.service';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiX, FiUserPlus, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import type { Team, RoleName } from '../types/index.js';

const Teams: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedHierarchyTeam, setSelectedHierarchyTeam] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadId: '',
    parentTeamId: '',
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAll(),
  });

  const { data: hierarchy } = useQuery({
    queryKey: ['team-hierarchy'],
    queryFn: () => teamService.getHierarchy(),
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
      queryClient.invalidateQueries({ queryKey: ['team-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSelectedHierarchyTeam(null); // Clear selected team in hierarchy view
      closeModal();
      closeManageMembersModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-hierarchy'] });
      setSelectedHierarchyTeam(null); // Clear selected team in hierarchy view
    },
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      teamService.addTeamMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      teamService.removeTeamMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-hierarchy'] });
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
      parentTeamId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      leadId: team.leadId || '',
      parentTeamId: team.parentTeamId || '',
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

    // Prepare data with explicit null values for empty strings
    // This ensures the fields are included in the JSON payload
    const data: any = {
      name: formData.name,
      description: formData.description,
      leadId: formData.leadId || null,
      parentTeamId: formData.parentTeamId || null,
    };

    console.log('=== HANDLE SUBMIT ===');
    console.log('Form data:', formData);
    console.log('Prepared data:', data);
    console.log('Editing team:', editingTeam?.id);

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

  const handleAddTeamMember = (employeeId: string, teamId: string) => {
    addTeamMemberMutation.mutate({ teamId, employeeId });
  };

  const handleRemoveTeamMember = (employeeId: string, teamId: string) => {
    removeTeamMemberMutation.mutate({ teamId, employeeId });
  };

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getTeamMembers = (teamId: string) => {
    const team = teams?.find(t => t.id === teamId);
    if (!team) return [];

    // Get all team members from the junction table
    return (team as any).teamMemberships?.map((m: any) => m.employee) || [];
  };

  const getAllEmployees = () => {
    return employees || [];
  };

  const calculateTotalMembers = (node: any): number => {
    // Count members in this team
    let total = node.memberCount || 0;

    // Recursively add members from all subteams
    if (node.subTeams && node.subTeams.length > 0) {
      node.subTeams.forEach((subTeam: any) => {
        total += calculateTotalMembers(subTeam);
      });
    }

    return total;
  };

  const renderTeamHierarchy = (nodes: any[], level = 0): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => {
      const isSelected = selectedHierarchyTeam?.id === node.id;
      const totalMembers = calculateTotalMembers(node);

      return (
        <div key={node.id} style={{ marginLeft: `${level * 24}px` }} className="mb-2">
          <div
            className={`bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedHierarchyTeam(node)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {node.subTeams && node.subTeams.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTeamExpansion(node.id);
                    }}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {expandedTeams.has(node.id) ? (
                      <FiChevronDown className="h-5 w-5" />
                    ) : (
                      <FiChevronRight className="h-5 w-5" />
                    )}
                  </button>
                )}
                <FiUsers className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{node.name}</h3>
                  {node.description && (
                    <p className="text-sm text-gray-600">{node.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{node.memberCount} members</span>
                {canManageTeams && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const team = teams?.find(t => t.id === node.id);
                        if (team) openManageMembersModal(team);
                      }}
                      className="px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded"
                    >
                      Manage
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const team = teams?.find(t => t.id === node.id);
                        if (team) openEditModal(team);
                      }}
                      className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded"
                    >
                      <FiEdit2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {expandedTeams.has(node.id) && node.subTeams && renderTeamHierarchy(node.subTeams, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage teams, assign team leads, and add team members. Teams can be organized hierarchically with sub-teams.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-3">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-md`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                viewMode === 'hierarchy'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-md`}
            >
              Hierarchy
            </button>
          </div>
          {canManageTeams && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2" />
              Create Team
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : viewMode === 'hierarchy' ? (
        <div className="mt-8 flex gap-6">
          <div className="flex-1">
            {hierarchy && hierarchy.length > 0 ? (
              renderTeamHierarchy(hierarchy)
            ) : (
              <div className="text-center text-gray-500">No teams found</div>
            )}
          </div>
          {selectedHierarchyTeam && (
            <div className="w-96 bg-white shadow rounded-lg p-6 sticky top-6 self-start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Team Details</h3>
                <button
                  onClick={() => setSelectedHierarchyTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedHierarchyTeam.name}</h4>
                  {selectedHierarchyTeam.description && (
                    <p className="mt-1 text-sm text-gray-600">{selectedHierarchyTeam.description}</p>
                  )}
                </div>

                {selectedHierarchyTeam.lead && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</p>
                    <div className="mt-2 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {selectedHierarchyTeam.lead.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedHierarchyTeam.lead.name}</p>
                        <p className="text-xs text-gray-500">{selectedHierarchyTeam.lead.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Direct Members</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{selectedHierarchyTeam.memberCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total (with Subteams)</p>
                      <p className="mt-1 text-2xl font-semibold text-blue-600">{calculateTotalMembers(selectedHierarchyTeam)}</p>
                    </div>
                  </div>
                </div>

                {selectedHierarchyTeam.subTeams && selectedHierarchyTeam.subTeams.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Subteams ({selectedHierarchyTeam.subTeams.length})</p>
                    <div className="space-y-2">
                      {selectedHierarchyTeam.subTeams.map((subTeam: any) => (
                        <div
                          key={subTeam.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedHierarchyTeam(subTeam);
                            if (!expandedTeams.has(selectedHierarchyTeam.id)) {
                              toggleTeamExpansion(selectedHierarchyTeam.id);
                            }
                          }}
                        >
                          <span className="text-sm font-medium text-gray-900">{subTeam.name}</span>
                          <span className="text-xs text-gray-500">{subTeam.memberCount} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Team
                  </label>
                  <select
                    value={formData.parentTeamId}
                    onChange={(e) => setFormData({ ...formData, parentTeamId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">No Parent Team (Top Level)</option>
                    {teams?.filter((t) => t.id !== editingTeam?.id).map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
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
                    {getTeamMembers(selectedTeam.id).map((emp: any) => {
                      const isTeamLead = selectedTeam.leadId === emp.id;
                      return (
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
                                {isTeamLead && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    Team Lead
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">{emp.title}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${emp.firstName} ${emp.lastName} from ${selectedTeam.name}?`)) {
                                handleRemoveTeamMember(emp.id, selectedTeam.id);
                              }
                            }}
                            disabled={removeTeamMemberMutation.isPending}
                            className="px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* All Employees - Can Add to Team */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Add Employees to Team
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Employees can be members of multiple teams.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getAllEmployees()
                    .filter((emp) => !getTeamMembers(selectedTeam.id).some((m: any) => m.id === emp.id))
                    .map((emp) => (
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
                          onClick={() => handleAddTeamMember(emp.id, selectedTeam.id)}
                          disabled={addTeamMemberMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                </div>
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
