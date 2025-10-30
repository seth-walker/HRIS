import api from './api';
import type { AuditLog } from '../types/index';

interface AuditLogFilters {
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const auditLogService = {
  getAll: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/audit-logs?${params.toString()}`);
    return response.data;
  },

  getEntityHistory: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await api.get(`/audit-logs/entity?entityType=${entityType}&entityId=${entityId}`);
    return response.data;
  },
};
