import { supabase } from '../config/supabase';

export interface CommentRecord {
  comment_id: number;
  complaint_id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CommentCreateInput {
  complaint_id: number;
  user_id: string;
  content: string;
}

export interface EnrichedComment extends CommentRecord {
  first_name: string;
  last_name: string;
  role: string;
}

export const CommentModel = {
  async findByComplaintId(complaintId: number | string): Promise<CommentRecord[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('comment_id, complaint_id, user_id, content, created_at')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return (data || []) as CommentRecord[];
  },

  async create(input: CommentCreateInput): Promise<CommentRecord | null> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        complaint_id: input.complaint_id,
        user_id: input.user_id,
        content: input.content,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as CommentRecord;
  },

  async findById(commentId: number | string): Promise<CommentRecord | null> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('comment_id', commentId)
      .single();

    if (error || !data) return null;
    return data as CommentRecord;
  },

  async deleteById(commentId: number | string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', commentId);

    return !error;
  },

  async enrichMany(comments: CommentRecord[]): Promise<EnrichedComment[]> {
    return Promise.all(
      comments.map(async (comment) => {
        let first_name = '';
        let last_name = '';
        let role = '';

        const { data: uData } = await supabase
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
      })
    );
  },
};
