import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase, supabaseAnon } from '../config/supabase';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { env } from '../config/env';
import logger from '../config/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // 1. Find user from username in public.users table
    const { data: publicUser, error: findError } = await supabase
      .from('users')
      .select('user_id, password_hash, role, first_name, last_name')
      .ilike('username', username.trim())
      .single();

    if (findError || !publicUser) {
      logger.error('Username not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let userId = publicUser.user_id;

    // 2. Verify password
    if (publicUser.password_hash !== 'handled_by_supabase_auth') {
      // Local bcrypt authentication
      const isMatch = await bcrypt.compare(password, publicUser.password_hash);
      if (!isMatch) {
        logger.error('Invalid password via bcrypt for:', username);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      // Legacy Supabase Auth authentication
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(publicUser.user_id);
      
      if (authError || !authUser.user?.email) {
        logger.error('Error fetching auth user by ID:', authError?.message);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const email = authUser.user.email;

      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        logger.error('Login error from Supabase:', error?.message);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const role = publicUser.role || 'resident';
    const payload = { id: userId, role: role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info(`User logged in with username: ${username}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userId,
          email: '', // Email might not be available or needed if using local auth
          username: username,
          role: role,
          full_name: `${publicUser.first_name || ''} ${publicUser.last_name || ''}`.trim()
        },
        accessToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, first_name, last_name, role } = req.body;

    if (!email || !password || !username || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Sign up with Supabase Auth
    // Note: The handle_new_user trigger in Postgres will sync this to public.users
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name,
          last_name,
          role: role || 'resident'
        }
      }
    });

    if (error) {
      logger.error('Registration error from Supabase:', error.message);
      return res.status(400).json({ success: false, message: error.message });
    }

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification if enabled.',
      data: { 
        id: data.user?.id,
        email: data.user?.email,
        username,
        role: role || 'resident' 
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    // In a real Supabase app, you might want to use supabase.auth.refreshSession()
    // But since we use custom JWTs, we verify our own refresh token.
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

    res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await supabase.auth.signOut();
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== Forgot Password: Verify identity and issue a reset token =====
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { username, first_name, last_name } = req.body;

    if (!username || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้ ชื่อจริง และนามสกุล',
      });
    }

    // 1. Find user by username in public.users table
    const { data: userData, error: findError } = await supabase
      .from('users')
      .select('user_id, first_name, last_name')
      .ilike('username', username.trim())
      .single();

    if (findError || !userData) {
      logger.warn(`Forgot password: username not found - ${username}`);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบชื่อผู้ใช้งานในระบบ',
      });
    }

    // 2. Verify identity by matching first_name and last_name (case-insensitive)
    const isMatch =
      userData.first_name?.toLowerCase().trim() === first_name.toLowerCase().trim() &&
      userData.last_name?.toLowerCase().trim() === last_name.toLowerCase().trim();

    if (!isMatch) {
      logger.warn(`Forgot password: identity mismatch for username - ${username}`);
      return res.status(403).json({
        success: false,
        message: 'ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้ กรุณาตรวจสอบอีกครั้ง',
      });
    }

    // 3. Generate a short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
      { userId: userData.user_id, purpose: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info(`Forgot password: reset token issued for username - ${username}`);

    res.status(200).json({
      success: true,
      message: 'ยืนยันตัวตนสำเร็จ กรุณาตั้งรหัสผ่านใหม่',
      data: { resetToken },
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

// ===== Reset Password: Update password using reset token =====
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ token และรหัสผ่านใหม่',
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      });
    }

    // 1. Verify the reset token
    let decoded: { userId: string; purpose: string };
    try {
      decoded = jwt.verify(resetToken, env.JWT_SECRET) as { userId: string; purpose: string };
    } catch {
      return res.status(401).json({
        success: false,
        message: 'ลิงก์รีเซ็ตหมดอายุหรือไม่ถูกต้อง กรุณาเริ่มใหม่อีกครั้ง',
      });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง',
      });
    }

    // 2. Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update password_hash in public.users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('user_id', decoded.userId);

    if (dbError) {
      logger.error('Reset password error from DB:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
      });
    }

    // 4. Try to update Supabase Auth as well (if the user exists there)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      decoded.userId,
      { password: newPassword }
    );

    if (updateError && updateError.message !== 'User not found') {
      logger.warn(`Failed to update Supabase Auth for user ${decoded.userId}: ${updateError.message}`);
    }

    logger.info(`Password reset successful for user ID: ${decoded.userId}`);

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};
