import { Request, Response } from 'express';
import { CommentModel } from '../models/Comment.model';
import { ComplaintModel } from '../models/Complaint.model';
import { sendSuccess, sendError } from '../utils/response.util';
import logger from '../config/logger';

// ===== GET /api/complaints/:id/comments =====
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify complaint exists
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    // 1. Fetch and format regular comments
    const comments = await CommentModel.findByComplaintId(id);
    const enrichedComments = await CommentModel.enrichMany(comments);
    const formattedComments = enrichedComments.map(c => ({
      id: `comment_${c.comment_id}`,
      type: 'comment',
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      user_name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'ผู้ใช้',
      user_role: c.role || 'resident',
    }));

    // 2. Fetch and format audit logs
    const { AuditLogModel } = await import('../models/AuditLog.model');
    const { supabase } = await import('../config/supabase');
    
    const auditLogs = await AuditLogModel.findByEntity('complaint', id);
    const formattedAuditLogs = await Promise.all(
      auditLogs.map(async (log) => {
        let first_name = '';
        let last_name = '';
        let role = '';

        const { data: uData } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('user_id', log.user_id)
          .single();

        if (uData) {
          first_name = uData.first_name || '';
          last_name = uData.last_name || '';
          role = uData.role || '';
        }

        return {
          id: `log_${log.log_id}`,
          type: 'system_log',
          action: log.action,
          details: log.details,
          created_at: log.created_at,
          user_id: log.user_id,
          user_name: `${first_name} ${last_name}`.trim() || 'ระบบ',
          user_role: role || 'system',
        };
      })
    );

    // 3. Merge and sort chronologically (oldest first)
    const timeline = [...formattedComments, ...formattedAuditLogs];
    timeline.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 4. Check if missing create event
    const hasCreationEvent = timeline.some(e => 
      e.action === 'CREATE_COMPLAINT' || 
      e.action === 'CREATE_COMPLAINT_BY_STAFF' || 
      e.content === '[ระบบ] สร้างเรื่องร้องเรียนเข้าระบบ'
    );
    
    if (!hasCreationEvent) {
      let first_name = '';
      let last_name = '';
      if (complaint.resident_id) {
        const { data: resData } = await supabase.from('resident').select('user_id').eq('resident_id', complaint.resident_id).single();
        if (resData?.user_id) {
          const { data: uData } = await supabase.from('users').select('first_name, last_name').eq('user_id', resData.user_id).single();
          if (uData) {
            first_name = uData.first_name || '';
            last_name = uData.last_name || '';
          }
        }
      }

      timeline.unshift({
        id: 'legacy_create',
        type: 'system_log',
        action: 'CREATE_COMPLAINT',
        created_at: (complaint as any).reported_date || (complaint as any).created_at || new Date().toISOString(),
        user_id: '',
        user_name: `${first_name} ${last_name}`.trim() || 'ผู้ร้องเรียน',
        user_role: 'resident'
      });
    }

    return sendSuccess(res, timeline);
  } catch (error) {
    logger.error('Get comments/timeline error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== POST /api/complaints/:id/comments =====
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 'กรุณากรอกเนื้อหาความคิดเห็น', 400);
    }

    // Verify complaint exists
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    const comment = await CommentModel.create({
      complaint_id: Number(id),
      user_id: userId,
      content: content.trim(),
    });

    if (!comment) return sendError(res, 'Failed to create comment');

    logger.info(`Comment created on complaint ${id} by user ${userId}`);
    return sendSuccess(res, comment, 'เพิ่มความคิดเห็นสำเร็จ', 201);
  } catch (error) {
    logger.error('Create comment error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== DELETE /api/complaints/:id/comments/:commentId =====
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { commentId } = req.params;

    const comment = await CommentModel.findById(commentId);
    if (!comment) return sendError(res, 'ไม่พบความคิดเห็นนี้', 404);

    // Check permission: own comment or admin
    if (comment.user_id !== userId && role !== 'admin') {
      return sendError(res, 'ไม่มีสิทธิ์ลบความคิดเห็นนี้', 403);
    }

    const success = await CommentModel.deleteById(commentId);
    if (!success) return sendError(res, 'Failed to delete comment');

    logger.info(`Comment ${commentId} deleted by user ${userId}`);
    return sendSuccess(res, null, 'ลบความคิดเห็นสำเร็จ');
  } catch (error) {
    logger.error('Delete comment error:', error);
    return sendError(res, 'Internal server error');
  }
};
