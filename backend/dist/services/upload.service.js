"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Upload service — handles file upload to Supabase Storage
 */
exports.UploadService = {
    async uploadFile(bucket, path, file, contentType) {
        const { data, error } = await supabase_1.supabase.storage
            .from(bucket)
            .upload(path, file, {
            contentType,
            upsert: false,
        });
        if (error) {
            logger_1.default.error('File upload error:', error.message);
            return null;
        }
        // Get public URL
        const { data: urlData } = supabase_1.supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);
        return urlData.publicUrl;
    },
    async deleteFile(bucket, path) {
        const { error } = await supabase_1.supabase.storage
            .from(bucket)
            .remove([path]);
        if (error) {
            logger_1.default.error('File delete error:', error.message);
            return false;
        }
        return true;
    },
    /**
     * Validate file type and size
     */
    validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], maxSizeMB = 5) {
        if (!allowedTypes.includes(file.mimetype)) {
            return { valid: false, error: `ไฟล์ประเภท ${file.mimetype} ไม่รองรับ` };
        }
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            return { valid: false, error: `ไฟล์ขนาดเกิน ${maxSizeMB}MB` };
        }
        return { valid: true };
    },
};
