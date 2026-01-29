import { api } from './api';
import type { 
  Schedule, 
  ScheduleCreateRequest, 
  ScheduleUpdateRequest,
  SchedulesListResponse 
} from '@/types';

export const schedulesService = {
  getSchedules: async (): Promise<SchedulesListResponse> => {
    return api.get<SchedulesListResponse>('/schedules');
  },

  getSchedule: async (id: string): Promise<Schedule> => {
    return api.get<Schedule>(`/schedules/${id}`);
  },

  createSchedule: async (data: ScheduleCreateRequest): Promise<Schedule> => {
    return api.post<Schedule>('/schedules', data);
  },

  updateSchedule: async (id: string, data: ScheduleUpdateRequest): Promise<Schedule> => {
    return api.put<Schedule>(`/schedules/${id}`, data);
  },

  deleteSchedule: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Schedule> => {
    return api.put<Schedule>(`/schedules/${id}`, { is_active: isActive });
  },
};
