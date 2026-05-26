import { supabase } from '../config/supabase';

export interface ComplaintRecord {
  complaint_id: number;
  resident_id: number | null;
  ticket_no: string;
  subject: string;
  status: string;
  description: string;
  reported_date: string;
  location_written: string | null;
  attachment_url: string | null;
  intake_channel: string | null;
  petition: string | null;
}

export interface ComplaintCreateInput {
  resident_id: number;
  ticket_no: string;
  subject: string;
  description: string;
  status?: string;
  reported_date?: string;
  location_written?: string | null;
  intake_channel?: string | null;
  attachment_url?: string | null;
}

export interface ComplaintUpdateInput {
  subject?: string;
  description?: string;
  location_written?: string | null;
  intake_channel?: string | null;
  attachment_url?: string | null;
}

export interface EnrichedComplaint extends ComplaintRecord {
  house_no: string;
  first_name: string;
  last_name: string;
}

export const ComplaintModel = {
  async findByResidentId(residentId: number): Promise<ComplaintRecord[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('complaint_id, ticket_no, subject, status, reported_date, description')
      .eq('resident_id', residentId)
      .order('reported_date', { ascending: false });

    if (error) return [];
    return (data || []) as ComplaintRecord[];
  },

  async findById(complaintId: number | string): Promise<ComplaintRecord | null> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', complaintId)
      .single();

    if (error || !data) return null;
    return data as ComplaintRecord;
  },

  async findByIdAndResident(complaintId: number | string, residentId: number): Promise<ComplaintRecord | null> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', complaintId)
      .eq('resident_id', residentId)
      .single();

    if (error || !data) return null;
    return data as ComplaintRecord;
  },

  async findAll(): Promise<ComplaintRecord[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('complaint_id, ticket_no, subject, status, reported_date, location_written, description, attachment_url, intake_channel, petition, resident_id')
      .order('reported_date', { ascending: false });

    if (error) {
      console.error('Supabase error in findAll:', error);
      return [];
    }
    return (data || []) as ComplaintRecord[];
  },

  async create(input: ComplaintCreateInput): Promise<{ complaint_id: number; ticket_no: string } | null> {
    const { data, error } = await supabase
      .from('complaints')
      .insert({
        resident_id: input.resident_id,
        ticket_no: input.ticket_no,
        subject: input.subject,
        description: input.description,
        status: input.status || 'pending',
        reported_date: input.reported_date || new Date().toISOString(),
        location_written: input.location_written || null,
        intake_channel: input.intake_channel || null,
        attachment_url: input.attachment_url || null,
      })
      .select('complaint_id, ticket_no')
      .single();

    if (error || !data) return null;
    return data as { complaint_id: number; ticket_no: string };
  },

  async update(complaintId: number | string, input: ComplaintUpdateInput): Promise<ComplaintRecord | null> {
    const { data, error } = await supabase
      .from('complaints')
      .update({
        subject: input.subject,
        description: input.description,
        location_written: input.location_written || null,
        intake_channel: input.intake_channel || null,
        attachment_url: input.attachment_url || null,
      })
      .eq('complaint_id', complaintId)
      .select()
      .single();

    if (error || !data) return null;
    return data as ComplaintRecord;
  },

  async updateStatus(complaintId: number | string, status: string, petition?: string): Promise<ComplaintRecord | null> {
    const updateData: Record<string, any> = { status };
    if (petition !== undefined) {
      updateData.petition = petition;
    }
    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('complaint_id', complaintId)
      .select()
      .single();

    if (error || !data) return null;
    return data as ComplaintRecord;
  },

  async deleteById(complaintId: number | string): Promise<boolean> {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('complaint_id', complaintId);

    return !error;
  },

  async enrichWithResident(complaint: ComplaintRecord): Promise<EnrichedComplaint> {
    let house_no = '';
    let first_name = '';
    let last_name = '';

    if (complaint.resident_id) {
      const { data: rData } = await supabase
        .from('resident')
        .select('house_no, user_id')
        .eq('resident_id', complaint.resident_id)
        .single();

      if (rData) {
        house_no = rData.house_no || '';

        if (rData.user_id) {
          const { data: uData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('user_id', rData.user_id)
            .single();

          if (uData) {
            first_name = uData.first_name || '';
            last_name = uData.last_name || '';
          }
        }
      }
    }

    return { ...complaint, house_no, first_name, last_name };
  },

  async enrichMany(complaints: ComplaintRecord[]): Promise<EnrichedComplaint[]> {
    return Promise.all(complaints.map((c) => this.enrichWithResident(c)));
  },
};
