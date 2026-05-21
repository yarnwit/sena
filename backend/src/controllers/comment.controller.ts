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

    const comments = await CommentModel.findByComplaintId(id);
    const enriched = await CommentModel.enrichMany(comments);

    return sendSuccess(res, enriched);
  } catch (error) {
    logger.error('Get comments error:', error);
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
