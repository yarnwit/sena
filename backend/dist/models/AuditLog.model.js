"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModel = void 0;
const supabase_1 = require("../config/supabase");
exports.AuditLogModel = {
    async create(input) {
        const { data, error } = await supabase_1.supabase
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
        if (error || !data)
            return null;
        return data;
    },
    async findAll(limit = 100, offset = 0) {
        const { data, error } = await supabase_1.supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            return [];
        return (data || []);
    },
    async findByEntity(entity, entityId) {
        const { data, error } = await supabase_1.supabase
            .from('audit_logs')
            .select('*')
            .eq('entity', entity)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });
        if (error)
            return [];
        return (data || []);
    },
    async findByUserId(userId) {
        const { data, error } = await supabase_1.supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            return [];
        return (data || []);
    },
};
