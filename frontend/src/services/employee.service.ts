import api from './api.js';
import type { Employee, OrgChartNode } from '../types/index.js';

export const employeeService = {
  async getAll(filters?: {
    department?: string;
    status?: string;
    title?: string;
    search?: string;
    teamId?: string;
    managerId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees', { params: filters });
    return response.data;
  },

  async getOne(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async create(employee: Partial<Employee>): Promise<Employee> {
    const response = await api.post<Employee>('/employees', employee);
    return response.data;
  },

  async update(id: string, employee: Partial<Employee>): Promise<Employee> {
    const response = await api.put<Employee>(`/employees/${id}`, employee);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async getOrgChart(): Promise<OrgChartNode[]> {
    const response = await api.get<OrgChartNode[]>('/employees/org-chart');
    return response.data;
  },

  async getDirectReports(managerId: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>(`/employees/${managerId}/direct-reports`);
    return response.data;
  },

  async bulkImport(employees: Partial<Employee>[]): Promise<{
    created: number;
    updated: number;
    errors: any[];
  }> {
    const response = await api.post('/employees/bulk-import', employees);
    return response.data;
  },
};
