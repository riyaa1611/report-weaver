import { supabase } from '@/integrations/supabase/client';
import type { Template, TemplatesListResponse } from '@/types';

export const templatesService = {
  getTemplates: async (): Promise<TemplatesListResponse> => {
    const { data, error, count } = await supabase
      .from('templates')
      .select('*', { count: 'exact' })
      .order('name');

    if (error) throw error;

    const templates: Template[] = (data || []).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      thumbnail_url: t.thumbnail_url,
      category: t.category || 'General',
      schema: parseTemplateSchema(t.schema),
      sample_output_url: t.sample_output_url || undefined,
      created_at: t.created_at,
    }));

    return {
      items: templates,
      total: count || 0,
    };
  },

  getTemplate: async (id: string): Promise<Template> => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Template not found');

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      thumbnail_url: data.thumbnail_url,
      category: data.category || 'General',
      schema: parseTemplateSchema(data.schema),
      sample_output_url: data.sample_output_url || undefined,
      created_at: data.created_at,
    };
  },
};

// Helper to parse JSON schema into typed template parameters
function parseTemplateSchema(schema: unknown): Template['schema'] {
  if (!schema || typeof schema !== 'object') return [];
  
  const schemaObj = schema as Record<string, unknown>;
  const parameters = schemaObj.parameters;
  
  if (!Array.isArray(parameters)) return [];
  
  return parameters.map((param: Record<string, unknown>) => ({
    name: String(param.name || ''),
    type: (param.type as 'string' | 'number' | 'boolean' | 'date' | 'select') || 'string',
    label: String(param.label || param.name || ''),
    required: Boolean(param.required),
    default_value: param.default_value,
    options: Array.isArray(param.options) ? param.options.map(String) : undefined,
    description: param.description ? String(param.description) : undefined,
  }));
}
