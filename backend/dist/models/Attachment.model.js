"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentModel = void 0;
const supabase_1 = require("../config/supabase");
exports.AttachmentModel = {
    async findByComplaintId(complaintId) {
        const { data, error } = await supabase_1.supabase
            .from('attachments')
            .select('*')
            .eq('complaint_id', complaintId)
            .order('uploaded_at', { ascending: false });
        if (error)
            return [];
        return (data || []);
    },
    async create(input) {
        const { data, error } = await supabase_1.supabase
            .from('attachments')
            .insert({
            complaint_id: input.complaint_id,
            file_url: input.file_url,
            file_name: input.file_name,
            file_type: input.file_type,
            file_size: input.file_size,
        })
            .select()
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async deleteById(attachmentId) {
        const { error } = await supabase_1.supabase
            .from('attachments')
            .delete()
            .eq('attachment_id', attachmentId);
        return !error;
    },
};
