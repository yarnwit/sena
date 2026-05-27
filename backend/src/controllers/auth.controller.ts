import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import logger from '../config/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await AuthService.login(username, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Login successful');
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      logger.warn(`[LOGIN DEBUG] Controller caught Invalid credentials for: ${req.body.username}`);
      return sendError(res, 'Invalid credentials', 401);
    }
    logger.error('Login error:', error);
    return sendError(res, 'Internal server error');
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body);

    logger.info(`New user registered: ${req.body.email}`);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    logger.error('Registration error:', error);
    return sendError(res, error.message || 'Internal server error', 400);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 401);
    }

    const accessToken = await AuthService.refreshToken(refreshToken);
    return sendSuccess(res, { accessToken });
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await AuthService.logout();
    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    return sendError(res, 'Internal server error');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { username, first_name, last_name } = req.body;

    const resetToken = await AuthService.verifyIdentity(username, first_name, last_name);

    return sendSuccess(res, { resetToken }, 'ยืนยันตัวตนสำเร็จ กรุณาตั้งรหัสผ่านใหม่');
  } catch (error: any) {
    if (error.message === 'ไม่พบชื่อผู้ใช้งานในระบบ') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้') {
      return sendError(res, 'ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้ กรุณาตรวจสอบอีกครั้ง', 403);
    }
    logger.error('Forgot password error:', error);
    return sendError(res, 'เกิดข้อผิดพลาดภายในระบบ');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    await AuthService.resetPassword(resetToken, newPassword);

    return sendSuccess(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
  } catch (error: any) {
    if (error.message.includes('หมดอายุ') || error.message.includes('ไม่ถูกต้อง')) {
      return sendError(res, error.message, 401);
    }
    logger.error('Reset password error:', error);
    return sendError(res, 'เกิดข้อผิดพลาดภายในระบบ');
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 400);
    }

    await AuthService.changePassword(userId, newPassword);

    return sendSuccess(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
  } catch (error: any) {
    logger.error('Change password error:', error);
    return sendError(res, 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { supabase } = await import('../config/supabase');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token required', 401);
    }

    const { data: { user: authUser }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !authUser) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    await AuthService.deleteAccount(authUser.id);
    return sendSuccess(res, null, 'Account deleted successfully');
  } catch (error: any) {
    logger.error('Delete account error:', error);
    return sendError(res, error.message || 'Internal server error');
  }
};
