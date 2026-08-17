"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintModel = void 0;
const supabase_1 = require("../config/supabase");
exports.ComplaintModel = {
    async findByResidentId(residentId) {
        const { data, error } = await supabase_1.supabase
            .from('complaints')
            .select('complaint_id, ticket_no, subject, status, reported_date, description')
            .eq('resident_id', residentId)
            .order('complaint_id', { ascending: false });
        if (error)
            return [];
        return (data || []);
    },
    async findById(complaintId) {
        const { data, error } = await supabase_1.supabase
            .from('complaints')
            .select('*')
            .eq('complaint_id', complaintId)
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async findByIdAndResident(complaintId, residentId) {
        const { data, error } = await supabase_1.supabase
            .from('complaints')
            .select('*')
            .eq('complaint_id', complaintId)
            .eq('resident_id', residentId)
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from('complaints')
            .select('complaint_id, ticket_no, subject, status, reported_date, location_written, description, attachment_url, intake_channel, petition, resident_id')
            .order('complaint_id', { ascending: false });
        if (error) {
            console.error('Supabase error in findAll:', error);
            return [];
        }
        return (data || []);
    },
    async create(input) {
        const { data, error } = await supabase_1.supabase
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
        if (error) {
            console.error('Supabase error in ComplaintModel.create:', error);
            return null;
        }
        if (!data)
            return null;
        return data;
    },
    async update(complaintId, input) {
        const { data, error } = await supabase_1.supabase
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
        if (error || !data)
            return null;
        return data;
    },
    async updateStatus(complaintId, status, petition) {
        const updateData = { status };
        if (petition !== undefined) {
            updateData.petition = petition;
        }
        const { data, error } = await supabase_1.supabase
            .from('complaints')
            .update(updateData)
            .eq('complaint_id', complaintId)
            .select()
            .single();
        if (error || !data)
            return null;
        return data;
    },
    async deleteById(complaintId) {
        const { error } = await supabase_1.supabase
            .from('complaints')
            .delete()
            .eq('complaint_id', complaintId);
        return !error;
    },
    async enrichWithResident(complaint) {
        let house_no = '';
        let first_name = '';
        let last_name = '';
        if (complaint.resident_id) {
            const { data: rData } = await supabase_1.supabase
                .from('resident')
                .select('house_no, user_id')
                .eq('resident_id', complaint.resident_id)
                .single();
            if (rData) {
                house_no = rData.house_no || '';
                if (rData.user_id) {
                    const { data: uData } = await supabase_1.supabase
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
        else if (complaint.description && complaint.description.startsWith('[ผู้ร้อง:')) {
            // Extract manual info embedded by staff
            const match = complaint.description.match(/^\[ผู้ร้อง:\s*(.*?)\s*\|\s*บ้านเลขที่:\s*([^\]|]+)/);
            if (match) {
                const fullName = match[1].trim();
                const parts = fullName.split(' ');
                first_name = parts[0];
                last_name = parts.slice(1).join(' ');
                house_no = match[2].trim();
            }
        }
        return { ...complaint, house_no, first_name, last_name };
    },
    async enrichMany(complaints) {
        return Promise.all(complaints.map((c) => this.enrichWithResident(c)));
    },
};
