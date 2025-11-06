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
    const response = await api.put<Team>(`/teams/${id}`, team);
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
