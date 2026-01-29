import { api } from './api';
import type { Template, TemplatesListResponse } from '@/types';

export const templatesService = {
  getTemplates: async (): Promise<TemplatesListResponse> => {
    return api.get<TemplatesListResponse>('/templates');
  },

  getTemplate: async (id: string): Promise<Template> => {
    return api.get<Template>(`/templates/${id}`);
  },
};
