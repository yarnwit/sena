"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const supabase_1 = require("../config/supabase");
exports.UserModel = {
    async findByUsername(username) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('user_id, username, password_hash, role, first_name, last_name')
            .ilike('username', username.trim())
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async findById(userId) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('user_id, username, password_hash, role, first_name, last_name')
            .eq('user_id', userId)
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('user_id, username, role, first_name, last_name')
            .order('first_name', { ascending: true });
        if (error)
            return [];
        return (data || []);
    },
    async updatePassword(userId, passwordHash) {
        const { error } = await supabase_1.supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('user_id', userId);
        return !error;
    },
    async updateRole(userId, role) {
        const { error } = await supabase_1.supabase
            .from('users')
            .update({ role })
            .eq('user_id', userId);
        return !error;
    },
    async updateProfile(userId, data) {
        const { error } = await supabase_1.supabase
            .from('users')
            .update(data)
            .eq('user_id', userId);
        return !error;
    },
    async deleteById(userId) {
        const { error } = await supabase_1.supabase
            .from('users')
            .delete()
            .eq('user_id', userId);
        return !error;
    },
    async getRole(userId) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('role')
            .eq('user_id', userId)
            .single();
        if (error || !data)
            return null;
        return data.role;
    },
};
