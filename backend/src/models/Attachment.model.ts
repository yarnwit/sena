import { supabase } from '../config/supabase';

export interface AttachmentRecord {
  attachment_id: number;
  complaint_id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface AttachmentCreateInput {
  complaint_id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export const AttachmentModel = {
  async findByComplaintId(complaintId: number | string): Promise<AttachmentRecord[]> {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('uploaded_at', { ascending: false });

    if (error) return [];
    return (data || []) as AttachmentRecord[];
  },

  async create(input: AttachmentCreateInput): Promise<AttachmentRecord | null> {
    const { data, error } = await supabase
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

    if (error || !data) return null;
    return data as AttachmentRecord;
  },

  async deleteById(attachmentId: number | string): Promise<boolean> {
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('attachment_id', attachmentId);

    return !error;
  },
};
