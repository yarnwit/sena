import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import logger from '../config/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // 1. Find user_id from username in public.users table
    const { data: publicUser, error: findError } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', username)
      .single();

    if (findError || !publicUser) {
      logger.error('Username not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Get the real email from Supabase Auth using the user_id
    // This requires the Service Role Key (already configured in supabase.ts)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(publicUser.user_id);
    
    if (authError || !authUser.user?.email) {
      logger.error('Error fetching auth user by ID:', authError?.message);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const email = authUser.user.email;

    // 3. Sign in with the retrieved email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      logger.error('Login error from Supabase:', error?.message);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Fetch full user data for the response
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    const role = userData?.role || 'resident';
    const payload = { id: data.user.id, role: role };
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
          id: data.user.id,
          email: data.user.email,
          username: username,
          role: role,
          full_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim()
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

