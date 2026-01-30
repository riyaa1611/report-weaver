import { supabase } from '@/integrations/supabase/client';
import type { 
  Schedule, 
  ScheduleCreateRequest, 
  ScheduleUpdateRequest,
  SchedulesListResponse,
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

export const schedulesService = {
  getSchedules: async (): Promise<SchedulesListResponse> => {
    const { data, error, count } = await supabase
      .from('schedules')
      .select('*, templates(name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const schedules: Schedule[] = (data || []).map(s => ({
      id: s.id,
      user_id: s.user_id,
      template_id: s.template_id,
      template_name: (s.templates as { name: string } | null)?.name,
      name: s.name,
      cron_expression: s.cron_expression,
      params: (s.params as Record<string, unknown>) || {},
      data_source: parseDataSource(s.data_source),
      is_active: s.is_active,
      next_run: s.next_run || new Date().toISOString(),
      last_run: s.last_run,
      created_at: s.created_at,
    }));

    return {
      items: schedules,
      total: count || 0,
    };
  },

  getSchedule: async (id: string): Promise<Schedule> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*, templates(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Schedule not found');

    return {
      id: data.id,
      user_id: data.user_id,
      template_id: data.template_id,
      template_name: (data.templates as { name: string } | null)?.name,
      name: data.name,
      cron_expression: data.cron_expression,
      params: (data.params as Record<string, unknown>) || {},
      data_source: parseDataSource(data.data_source),
      is_active: data.is_active,
      next_run: data.next_run || new Date().toISOString(),
      last_run: data.last_run,
      created_at: data.created_at,
    };
  },

  createSchedule: async (reqData: ScheduleCreateRequest): Promise<Schedule> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const insertData = {
      user_id: user.id,
      template_id: reqData.template_id,
      name: reqData.name || 'Untitled Schedule',
      cron_expression: reqData.cron_expression,
      params: reqData.params || {},
      data_source: reqData.data_source,
      is_active: true,
    };

    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert(insertData as never)
      .select('*, templates(name)')
      .single();

    if (error) throw error;

    return {
      id: schedule.id,
      user_id: schedule.user_id,
      template_id: schedule.template_id,
      template_name: (schedule.templates as { name: string } | null)?.name,
      name: schedule.name,
      cron_expression: schedule.cron_expression,
      params: (schedule.params as Record<string, unknown>) || {},
      data_source: parseDataSource(schedule.data_source),
      is_active: schedule.is_active,
      next_run: schedule.next_run || new Date().toISOString(),
      last_run: schedule.last_run,
      created_at: schedule.created_at,
    };
  },

  updateSchedule: async (id: string, reqData: ScheduleUpdateRequest): Promise<Schedule> => {
    const updateData: Record<string, unknown> = {};
    if (reqData.cron_expression !== undefined) updateData.cron_expression = reqData.cron_expression;
    if (reqData.params !== undefined) updateData.params = reqData.params;
    if (reqData.data_source !== undefined) updateData.data_source = reqData.data_source;
    if (reqData.is_active !== undefined) updateData.is_active = reqData.is_active;
    if (reqData.name !== undefined) updateData.name = reqData.name;

    const { data: schedule, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .select('*, templates(name)')
      .single();

    if (error) throw error;

    return {
      id: schedule.id,
      user_id: schedule.user_id,
      template_id: schedule.template_id,
      template_name: (schedule.templates as { name: string } | null)?.name,
      name: schedule.name,
      cron_expression: schedule.cron_expression,
      params: (schedule.params as Record<string, unknown>) || {},
      data_source: parseDataSource(schedule.data_source),
      is_active: schedule.is_active,
      next_run: schedule.next_run || new Date().toISOString(),
      last_run: schedule.last_run,
      created_at: schedule.created_at,
    };
  },

  deleteSchedule: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Schedule> => {
    return schedulesService.updateSchedule(id, { is_active: isActive });
  },
};
