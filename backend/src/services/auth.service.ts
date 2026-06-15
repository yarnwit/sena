import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { supabase, supabaseAnon } from '../config/supabase';
import { UserModel } from '../models/User.model';
import { AuditLogModel } from '../models/AuditLog.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { env } from '../config/env';
import logger from '../config/logger';

export interface LoginResult {
  user: {
    id: string;
    username: string;
    role: string;
    full_name: string;
    house_no?: string;
    phase?: string;
    soi?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  async login(username: string, password: string): Promise<LoginResult> {
    logger.info(`[AuthService.login] Attempting login for username: ${username}`);
    // 1. Find user
    const user = await UserModel.findByUsername(username);
    if (!user) {
      logger.warn(`[AuthService.login] User not found for username: ${username}`);
      throw new Error('Invalid credentials');
    }
    logger.info(`[AuthService.login] User found in DB: ${user.username}, password_hash: ${user.password_hash.substring(0, 10)}...`);

    // 2. Verify password
    if (user.password_hash !== 'handled_by_supabase_auth') {
      // Local bcrypt authentication
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        logger.error('[AuthService.login] Invalid password via bcrypt for:', username);
        throw new Error('Invalid credentials');
      }
    } else {
      // Legacy Supabase Auth authentication
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.user_id);

      if (authError || !authUser.user?.email) {
        logger.error('[AuthService.login] Error fetching auth user by ID:', authError?.message);
        throw new Error('Invalid credentials');
      }

      const { error } = await supabaseAnon.auth.signInWithPassword({
        email: authUser.user.email,
        password,
      });

      if (error) {
        logger.error(`[AuthService.login] Login error from Supabase for ${authUser.user.email}:`, error.message);
        throw new Error('Invalid credentials');
      }
    }

    // 3. Generate tokens
    const role = user.role || 'resident';
    const payload = { id: user.user_id, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    let residentData = null;
    if (role === 'resident') {
      const { data } = await supabase
        .from('resident')
        .select('house_no, phase, soi')
        .eq('user_id', user.user_id)
        .single();
      if (data) residentData = data;
    }

    logger.info(`[AuthService.login] User logged in with username: ${username}`);

    return {
      user: {
        id: user.user_id,
        username,
        role,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        house_no: residentData?.house_no,
        phase: residentData?.phase,
        soi: residentData?.soi,
      },
      accessToken,
      refreshToken,
    };
  },

  async register(data: {
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    house_no?: string;
    phone_number?: string;
    resident_type?: string;
    phase?: string;
    soi?: string;
    role?: string;
  }) {
    // Check if username already exists
    const existingUser = await UserModel.findByUsername(data.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const userId = randomUUID();

    const { error: insertUserError } = await supabase.from('users').insert({
      user_id: userId,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role || 'resident',
      password_hash: hashedPassword
    });

    if (insertUserError) {
      logger.error('[AuthService.register] Error inserting user manually:', insertUserError);
      throw new Error('Failed to create user in database');
    }

    if ((data.role || 'resident') === 'resident') {
      const { error: insertResidentError } = await supabase.from('resident').insert({
        user_id: userId,
        house_no: data.house_no,
        phone_number: data.phone_number,
        resident_type: data.resident_type || 'owner',
        phase: data.phase,
        soi: data.soi,
      });
      
      if (insertResidentError && insertResidentError.code !== '23505') {
        logger.error('[AuthService.register] Error inserting resident manually:', insertResidentError);
        // Rollback user creation
        await supabase.from('users').delete().eq('user_id', userId);
        throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว (Database Error) กรุณาลองใหม่อีกครั้ง');
      }
    }

    logger.info(`[AuthService.register] New user registered: ${data.username}`);

    return {
      id: userId,
      username: data.username,
      role: data.role || 'resident',
    };
  },

  async refreshToken(token: string): Promise<{ accessToken: string, refreshToken: string }> {
    const decoded = verifyRefreshToken(token);
    const payload = { id: decoded.id, role: decoded.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async verifyIdentity(username: string, firstName: string, lastName: string): Promise<string> {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('ไม่พบชื่อผู้ใช้งานในระบบ');
    }

    const isMatch =
      user.first_name?.toLowerCase().trim() === firstName.toLowerCase().trim() &&
      user.last_name?.toLowerCase().trim() === lastName.toLowerCase().trim();

    if (!isMatch) {
      throw new Error('ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.user_id, purpose: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info(`[AuthService.verifyIdentity] Reset token issued for username: ${username}`);
    return resetToken;
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    // 1. Verify token
    let decoded: { userId: string; purpose: string };
    try {
      decoded = jwt.verify(resetToken, env.JWT_SECRET) as { userId: string; purpose: string };
    } catch {
      throw new Error('ลิงก์รีเซ็ตหมดอายุหรือไม่ถูกต้อง');
    }

    if (decoded.purpose !== 'password_reset') {
      throw new Error('Token ไม่ถูกต้อง');
    }

    // 2. Hash new password (salt rounds 12 via hash.util)
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update in DB
    const success = await UserModel.updatePassword(decoded.userId, hashedPassword);
    if (!success) {
      throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }

    // 4. Try to update Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(decoded.userId, { password: newPassword });
    if (error && error.message !== 'User not found') {
      logger.warn(`[AuthService.resetPassword] Failed to update Supabase Auth for user ${decoded.userId}: ${error.message}`);
    }

    logger.info(`[AuthService.resetPassword] Password reset successful for user ID: ${decoded.userId}`);
  },

  async changePassword(userId: string, newPassword: string): Promise<void> {
    // 1. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 2. Update in DB
    const success = await UserModel.updatePassword(userId, hashedPassword);
    if (!success) {
      throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }

    // 3. Try to update Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    if (error && error.message !== 'User not found') {
      logger.warn(`[AuthService.changePassword] Failed to update Supabase Auth for user ${userId}: ${error.message}`);
    }

    logger.info(`[AuthService.changePassword] Password changed successfully for user ID: ${userId}`);
  },

  async deleteAccount(userId: string): Promise<void> {
    // 1. Delete resident data
    const { error: residentError } = await (await import('../config/supabase')).supabase
      .from('resident')
      .delete()
      .eq('user_id', userId);

    if (residentError) {
      logger.error('[AuthService.deleteAccount] Error deleting resident data:', residentError.message);
    }

    // 2. Delete user data
    const success = await UserModel.deleteById(userId);
    if (!success) {
      throw new Error('Failed to delete user data');
    }

    // 3. Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      logger.warn(`[AuthService.deleteAccount] Failed to delete auth account for ${userId}: ${authError.message}`);
    }

    logger.info(`[AuthService.deleteAccount] Account deleted for user: ${userId}`);
  },
};
