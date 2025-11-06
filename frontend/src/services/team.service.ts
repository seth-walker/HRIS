import api from './api.js';
import type { Team, TeamHierarchyNode } from '../types/index.js';

export const teamService = {
  async getAll(search?: string): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams', { params: { search } });
    return response.data;
  },

  async getOne(id: string): Promise<Team> {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  async create(team: Partial<Team>): Promise<Team> {
    const response = await api.post<Team>('/teams', team);
    return response.data;
  },

  async update(id: string, team: Partial<Team>): Promise<Team> {
    console.log('=== FRONTEND UPDATE TEAM ===');
    console.log('Team ID:', id);
    console.log('Update data:', JSON.stringify(team, null, 2));
    console.log('parentTeamId value:', team.parentTeamId);
    console.log('parentTeamId type:', typeof team.parentTeamId);
    const response = await api.put<Team>(`/teams/${id}`, team);
    console.log('=== UPDATE RESPONSE ===');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async getHierarchy(): Promise<TeamHierarchyNode[]> {
    const response = await api.get<TeamHierarchyNode[]>('/teams/hierarchy');
    return response.data;
  },

  async addTeamMember(teamId: string, employeeId: string): Promise<void> {
    await api.post(`/teams/${teamId}/members/${employeeId}`);
  },

  async removeTeamMember(teamId: string, employeeId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${employeeId}`);
  },

  async getTeamMembers(teamId: string): Promise<any[]> {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },
};
