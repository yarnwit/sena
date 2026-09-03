"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getComments = void 0;
const Comment_model_1 = require("../models/Comment.model");
const Complaint_model_1 = require("../models/Complaint.model");
const response_util_1 = require("../utils/response.util");
const logger_1 = __importDefault(require("../config/logger"));
// ===== GET /api/complaints/:id/comments =====
const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify complaint exists
        const complaint = await Complaint_model_1.ComplaintModel.findById(id);
        if (!complaint)
            return (0, response_util_1.sendError)(res, 'ไม่พบคำร้องนี้', 404);
        // 1. Fetch and format regular comments
        const comments = await Comment_model_1.CommentModel.findByComplaintId(id);
        const enrichedComments = await Comment_model_1.CommentModel.enrichMany(comments);
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
        const { AuditLogModel } = await Promise.resolve().then(() => __importStar(require('../models/AuditLog.model')));
        const { supabase } = await Promise.resolve().then(() => __importStar(require('../config/supabase')));
        const auditLogs = await AuditLogModel.findByEntity('complaint', id);
        const formattedAuditLogs = await Promise.all(auditLogs.map(async (log) => {
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
        }));
        // 3. Merge and sort chronologically (oldest first)
        const timeline = [...formattedComments, ...formattedAuditLogs];
        timeline.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        // 4. Check if missing create event
        const hasCreationEvent = timeline.some(e => e.action === 'CREATE_COMPLAINT' ||
            e.action === 'CREATE_COMPLAINT_BY_STAFF' ||
            e.content === '[ระบบ] สร้างเรื่องร้องเรียนเข้าระบบ');
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
                created_at: complaint.reported_date || complaint.created_at || new Date().toISOString(),
                user_id: '',
                user_name: `${first_name} ${last_name}`.trim() || 'ผู้ร้องเรียน',
                user_role: 'resident'
            });
        }
        return (0, response_util_1.sendSuccess)(res, timeline);
    }
    catch (error) {
        logger_1.default.error('Get comments/timeline error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getComments = getComments;
// ===== POST /api/complaints/:id/comments =====
const createComment = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
        const { id } = req.params;
        const { content } = req.body;
        if (!content || !content.trim()) {
            return (0, response_util_1.sendError)(res, 'กรุณากรอกเนื้อหาความคิดเห็น', 400);
        }
        // Verify complaint exists
        const complaint = await Complaint_model_1.ComplaintModel.findById(id);
        if (!complaint)
            return (0, response_util_1.sendError)(res, 'ไม่พบคำร้องนี้', 404);
        const comment = await Comment_model_1.CommentModel.create({
            complaint_id: Number(id),
            user_id: userId,
            content: content.trim(),
        });
        if (!comment)
            return (0, response_util_1.sendError)(res, 'Failed to create comment');
        logger_1.default.info(`Comment created on complaint ${id} by user ${userId}`);
        return (0, response_util_1.sendSuccess)(res, comment, 'เพิ่มความคิดเห็นสำเร็จ', 201);
    }
    catch (error) {
        logger_1.default.error('Create comment error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.createComment = createComment;
// ===== DELETE /api/complaints/:id/comments/:commentId =====
const deleteComment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId)
            return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
        const { commentId } = req.params;
        const comment = await Comment_model_1.CommentModel.findById(commentId);
        if (!comment)
            return (0, response_util_1.sendError)(res, 'ไม่พบความคิดเห็นนี้', 404);
        // Check permission: own comment or admin
        if (comment.user_id !== userId && role !== 'admin') {
            return (0, response_util_1.sendError)(res, 'ไม่มีสิทธิ์ลบความคิดเห็นนี้', 403);
        }
        const success = await Comment_model_1.CommentModel.deleteById(commentId);
        if (!success)
            return (0, response_util_1.sendError)(res, 'Failed to delete comment');
        logger_1.default.info(`Comment ${commentId} deleted by user ${userId}`);
        return (0, response_util_1.sendSuccess)(res, null, 'ลบความคิดเห็นสำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Delete comment error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.deleteComment = deleteComment;
