import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { ComplaintService } from '../services/complaint.service';
import { sendSuccess, sendError } from '../utils/response.util';
import logger from '../config/logger';

// ===== GET /api/users/profile =====
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const user = await UserModel.findById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    const residentInfo = await ComplaintService.getResidentInfo(userId);

    return sendSuccess(res, {
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      house_no: residentInfo.house_no,
      phone_number: residentInfo.phone_number,
      resident_type: residentInfo.resident_type,
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== PATCH /api/users/profile =====
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { first_name, last_name } = req.body;

    const success = await UserModel.updateProfile(userId, {
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
    });

    if (!success) return sendError(res, 'Failed to update profile');

    logger.info(`Profile updated for user: ${userId}`);
    return sendSuccess(res, null, 'อัปเดตโปรไฟล์สำเร็จ');
  } catch (error) {
    logger.error('Update profile error:', error);
    return sendError(res, 'Internal server error');
  }
};
