import { api } from './api';
import type { 
  Report, 
  ReportCreateRequest, 
  ReportGenerateResponse, 
  ReportsListResponse,
  ReportsFilters 
} from '@/types';

export const reportsService = {
  getReports: async (filters?: ReportsFilters): Promise<ReportsListResponse> => {
    const params: Record<string, string | number | undefined> = {
      page: filters?.page,
      limit: filters?.limit,
      status: filters?.status === 'all' ? undefined : filters?.status,
      template_id: filters?.template_id,
      date_from: filters?.date_from,
      date_to: filters?.date_to,
      search: filters?.search,
    };
    
    return api.get<ReportsListResponse>('/reports', { params });
  },

  getReport: async (id: string): Promise<Report> => {
    return api.get<Report>(`/reports/${id}`);
  },

  generateReport: async (data: ReportCreateRequest): Promise<ReportGenerateResponse> => {
    return api.post<ReportGenerateResponse>('/reports/generate', data);
  },

  downloadReport: async (id: string, filename?: string): Promise<void> => {
    await api.downloadFile(`/reports/${id}/download`, filename || `report-${id}.pdf`);
  },

  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },
};
