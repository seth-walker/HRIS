import api from './api.js';

export const importExportService = {
  async importCSVFile(file: File): Promise<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import-export/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async importCSVText(csvContent: string): Promise<{ success: number; errors: any[] }> {
    const response = await api.post('/import-export/import/csv-text', { csvContent });
    return response.data;
  },

  async downloadCSVTemplate(): Promise<void> {
    const response = await api.get('/import-export/template/csv', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employee-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportEmployeesExcel(filters?: {
    department?: string;
    status?: string;
    teamId?: string;
    managerId?: string;
    title?: string;
  }): Promise<void> {
    const response = await api.get('/import-export/export/employees/excel', {
      params: filters,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `employees-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportTeamsExcel(): Promise<void> {
    const response = await api.get('/import-export/export/teams/excel', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `teams-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportEmployeesPDF(filters?: {
    department?: string;
    status?: string;
    teamId?: string;
    managerId?: string;
    title?: string;
  }): Promise<void> {
    const response = await api.get('/import-export/export/employees/pdf', {
      params: filters,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `employees-${new Date().toISOString().split('T')[0]}.pdf`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportOrgChartPDF(): Promise<void> {
    const response = await api.get('/import-export/export/org-chart/pdf', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `org-chart-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
