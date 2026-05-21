import { supabase } from '../config/supabase';

export interface AuditLogRecord {
  log_id: number;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface AuditLogCreateInput {
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}

export const AuditLogModel = {
  async create(input: AuditLogCreateInput): Promise<AuditLogRecord | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: input.user_id,
        action: input.action,
        entity: input.entity,
        entity_id: input.entity_id,
        details: input.details || {},
        ip_address: input.ip_address || '',
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as AuditLogRecord;
  },

  async findAll(limit: number = 100, offset: number = 0): Promise<AuditLogRecord[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return [];
    return (data || []) as AuditLogRecord[];
  },

  async findByEntity(entity: string, entityId: string): Promise<AuditLogRecord[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity', entity)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as AuditLogRecord[];
  },

  async findByUserId(userId: string): Promise<AuditLogRecord[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as AuditLogRecord[];
  },
};
