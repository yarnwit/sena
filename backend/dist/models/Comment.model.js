"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const supabase_1 = require("../config/supabase");
exports.CommentModel = {
    async findByComplaintId(complaintId) {
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .select('comment_id, complaint_id, user_id, content, created_at')
            .eq('complaint_id', complaintId)
            .order('created_at', { ascending: true });
        if (error)
            return [];
        return (data || []);
    },
    async create(input) {
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .insert({
            complaint_id: input.complaint_id,
            user_id: input.user_id,
            content: input.content,
        })
            .select()
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async findById(commentId) {
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .select('*')
            .eq('comment_id', commentId)
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async deleteById(commentId) {
        const { error } = await supabase_1.supabase
            .from('comments')
            .delete()
            .eq('comment_id', commentId);
        return !error;
    },
    async enrichMany(comments) {
        return Promise.all(comments.map(async (comment) => {
            let first_name = '';
            let last_name = '';
            let role = '';
            const { data: uData } = await supabase_1.supabase
                .from('users')
                .select('first_name, last_name, role')
                .eq('user_id', comment.user_id)
                .single();
            if (uData) {
                first_name = uData.first_name || '';
                last_name = uData.last_name || '';
                role = uData.role || '';
            }
            return { ...comment, first_name, last_name, role };
        }));
    },
};
