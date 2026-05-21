import { supabase } from '../config/supabase';
import logger from '../config/logger';

/**
 * Upload service — handles file upload to Supabase Storage
 */
export const UploadService = {
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string
  ): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      logger.error('File upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      logger.error('File delete error:', error.message);
      return false;
    }

    return true;
  },

  /**
   * Validate file type and size
   */
  validateFile(
    file: { mimetype: string; size: number },
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSizeMB: number = 5
  ): { valid: boolean; error?: string } {
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
