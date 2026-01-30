import { supabase } from '@/integrations/supabase/client';
import type { 
  Report, 
  ReportCreateRequest, 
  ReportGenerateResponse, 
  ReportsListResponse,
  ReportsFilters,
  DataSource 
} from '@/types';

// Helper to safely parse data_source from JSON
function parseDataSource(ds: unknown): DataSource {
  if (!ds || typeof ds !== 'object') {
    return { type: 'csv', config: {} };
  }
  const obj = ds as Record<string, unknown>;
  return {
    type: (obj.type as DataSource['type']) || 'csv',
    config: (obj.config as DataSource['config']) || {},
  };
}

export const reportsService = {
  getReports: async (filters?: ReportsFilters): Promise<ReportsListResponse> => {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reports')
      .select('*, templates(name)', { count: 'exact' });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.template_id) {
      query = query.eq('template_id', filters.template_id);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const reports: Report[] = (data || []).map(r => ({
      id: r.id,
      user_id: r.user_id,
      template_id: r.template_id,
      template_name: (r.templates as { name: string } | null)?.name,
      status: r.status as Report['status'],
      file_path: r.file_path,
      file_size: r.file_size,
      params: (r.params as Record<string, unknown>) || {},
      data_source: parseDataSource(r.data_source),
      error_message: r.error_message,
      created_at: r.created_at,
      completed_at: r.completed_at,
    }));

    return {
      items: reports,
      total: count || 0,
      page,
      limit,
    };
  },

  getReport: async (id: string): Promise<Report> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*, templates(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Report not found');

    return {
      id: data.id,
      user_id: data.user_id,
      template_id: data.template_id,
      template_name: (data.templates as { name: string } | null)?.name,
      status: data.status as Report['status'],
      file_path: data.file_path,
      file_size: data.file_size,
      params: (data.params as Record<string, unknown>) || {},
      data_source: parseDataSource(data.data_source),
      error_message: data.error_message,
      created_at: data.created_at,
      completed_at: data.completed_at,
    };
  },

  generateReport: async (reqData: ReportCreateRequest): Promise<ReportGenerateResponse> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const insertData = {
      user_id: user.id,
      template_id: reqData.template_id,
      params: reqData.params || {},
      data_source: reqData.data_source,
      status: 'pending' as const,
    };

    const { data: report, error } = await supabase
      .from('reports')
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw error;

    return {
      job_id: report.id,
      report_id: report.id,
    };
  },

  downloadReport: async (id: string, filename?: string): Promise<void> => {
    // For now, this is a placeholder - actual file download would need storage integration
    const { data, error } = await supabase
      .from('reports')
      .select('file_path')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data?.file_path) throw new Error('Report file not available');

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('reports')
      .download(data.file_path);

    if (downloadError) throw downloadError;

    const url = URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `report-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  deleteReport: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
