import { supabase } from '../config/supabase';

export interface UserRecord {
  user_id: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const UserModel = {
  async findByUsername(username: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, password_hash, role, first_name, last_name')
      .ilike('username', username.trim())
      .single();

    if (error || !data) return null;
    return data as UserRecord;
  },

  async findById(userId: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, password_hash, role, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as UserRecord;
  },

  async findAll(): Promise<UserRecord[]> {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, role, first_name, last_name')
      .order('first_name', { ascending: true });

    if (error) return [];
    return (data || []) as UserRecord[];
  },

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('user_id', userId);

    return !error;
  },

  async updateRole(userId: string, role: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('user_id', userId);

    return !error;
  },

  async updateProfile(userId: string, data: Partial<Pick<UserRecord, 'first_name' | 'last_name'>>): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('user_id', userId);

    return !error;
  },

  async deleteById(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    return !error;
  },

  async getRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.role;
  },
};
