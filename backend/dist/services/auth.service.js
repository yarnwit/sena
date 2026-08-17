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
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const supabase_1 = require("../config/supabase");
const User_model_1 = require("../models/User.model");
const jwt_util_1 = require("../utils/jwt.util");
const hash_util_1 = require("../utils/hash.util");
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
exports.AuthService = {
    async login(username, password) {
        logger_1.default.info(`[AuthService.login] Attempting login for username: ${username}`);
        // 1. Find user
        const user = await User_model_1.UserModel.findByUsername(username);
        if (!user) {
            logger_1.default.warn(`[AuthService.login] User not found for username: ${username}`);
            throw new Error('Invalid credentials');
        }
        logger_1.default.info(`[AuthService.login] User found in DB: ${user.username}, password_hash: ${user.password_hash.substring(0, 10)}...`);
        // 2. Verify password
        if (user.password_hash !== 'handled_by_supabase_auth') {
            // Local bcrypt authentication
            const isMatch = await (0, hash_util_1.comparePassword)(password, user.password_hash);
            if (!isMatch) {
                logger_1.default.error('[AuthService.login] Invalid password via bcrypt for:', username);
                throw new Error('Invalid credentials');
            }
        }
        else {
            // Legacy Supabase Auth authentication
            const { data: authUser, error: authError } = await supabase_1.supabase.auth.admin.getUserById(user.user_id);
            if (authError || !authUser.user?.email) {
                logger_1.default.error('[AuthService.login] Error fetching auth user by ID:', authError?.message);
                throw new Error('Invalid credentials');
            }
            const { error } = await supabase_1.supabaseAnon.auth.signInWithPassword({
                email: authUser.user.email,
                password,
            });
            if (error) {
                logger_1.default.error(`[AuthService.login] Login error from Supabase for ${authUser.user.email}:`, error.message);
                throw new Error('Invalid credentials');
            }
        }
        // 3. Generate tokens
        const role = user.role || 'resident';
        const payload = { id: user.user_id, role };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        let residentData = null;
        if (role === 'resident') {
            const { data } = await supabase_1.supabase
                .from('resident')
                .select('house_no, phase, soi')
                .eq('user_id', user.user_id)
                .single();
            if (data)
                residentData = data;
        }
        logger_1.default.info(`[AuthService.login] User logged in with username: ${username}`);
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
    async register(data) {
        // Check if username already exists
        const existingUser = await User_model_1.UserModel.findByUsername(data.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await (0, hash_util_1.hashPassword)(data.password);
        const userId = (0, crypto_1.randomUUID)();
        const { error: insertUserError } = await supabase_1.supabase.from('users').insert({
            user_id: userId,
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role || 'resident',
            password_hash: hashedPassword
        });
        if (insertUserError) {
            logger_1.default.error('[AuthService.register] Error inserting user manually:', insertUserError);
            throw new Error('Failed to create user in database');
        }
        if ((data.role || 'resident') === 'resident') {
            const { error: insertResidentError } = await supabase_1.supabase.from('resident').insert({
                user_id: userId,
                house_no: data.house_no,
                phone_number: data.phone_number,
                resident_type: data.resident_type || 'owner',
                phase: data.phase,
                soi: data.soi,
            });
            if (insertResidentError && insertResidentError.code !== '23505') {
                logger_1.default.error('[AuthService.register] Error inserting resident manually:', insertResidentError);
                // Rollback user creation
                await supabase_1.supabase.from('users').delete().eq('user_id', userId);
                throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว (Database Error) กรุณาลองใหม่อีกครั้ง');
            }
        }
        logger_1.default.info(`[AuthService.register] New user registered: ${data.username}`);
        return {
            id: userId,
            username: data.username,
            role: data.role || 'resident',
        };
    },
    async refreshToken(token) {
        const decoded = (0, jwt_util_1.verifyRefreshToken)(token);
        const payload = { id: decoded.id, role: decoded.role };
        return {
            accessToken: (0, jwt_util_1.generateAccessToken)(payload),
            refreshToken: (0, jwt_util_1.generateRefreshToken)(payload),
        };
    },
    async logout() {
        await supabase_1.supabase.auth.signOut();
    },
    async verifyIdentity(username, firstName, lastName) {
        const user = await User_model_1.UserModel.findByUsername(username);
        if (!user) {
            throw new Error('ไม่พบชื่อผู้ใช้งานในระบบ');
        }
        const isMatch = user.first_name?.toLowerCase().trim() === firstName.toLowerCase().trim() &&
            user.last_name?.toLowerCase().trim() === lastName.toLowerCase().trim();
        if (!isMatch) {
            throw new Error('ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้');
        }
        // Generate reset token
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.user_id, purpose: 'password_reset' }, env_1.env.JWT_SECRET, { expiresIn: '15m' });
        logger_1.default.info(`[AuthService.verifyIdentity] Reset token issued for username: ${username}`);
        return resetToken;
    },
    async resetPassword(resetToken, newPassword) {
        // 1. Verify token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(resetToken, env_1.env.JWT_SECRET);
        }
        catch {
            throw new Error('ลิงก์รีเซ็ตหมดอายุหรือไม่ถูกต้อง');
        }
        if (decoded.purpose !== 'password_reset') {
            throw new Error('Token ไม่ถูกต้อง');
        }
        // 2. Hash new password (salt rounds 12 via hash.util)
        const hashedPassword = await (0, hash_util_1.hashPassword)(newPassword);
        // 3. Update in DB
        const success = await User_model_1.UserModel.updatePassword(decoded.userId, hashedPassword);
        if (!success) {
            throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
        }
        // 4. Try to update Supabase Auth
        const { error } = await supabase_1.supabase.auth.admin.updateUserById(decoded.userId, { password: newPassword });
        if (error && error.message !== 'User not found') {
            logger_1.default.warn(`[AuthService.resetPassword] Failed to update Supabase Auth for user ${decoded.userId}: ${error.message}`);
        }
        logger_1.default.info(`[AuthService.resetPassword] Password reset successful for user ID: ${decoded.userId}`);
    },
    async changePassword(userId, newPassword) {
        // 1. Hash new password
        const hashedPassword = await (0, hash_util_1.hashPassword)(newPassword);
        // 2. Update in DB
        const success = await User_model_1.UserModel.updatePassword(userId, hashedPassword);
        if (!success) {
            throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
        }
        // 3. Try to update Supabase Auth
        const { error } = await supabase_1.supabase.auth.admin.updateUserById(userId, { password: newPassword });
        if (error && error.message !== 'User not found') {
            logger_1.default.warn(`[AuthService.changePassword] Failed to update Supabase Auth for user ${userId}: ${error.message}`);
        }
        logger_1.default.info(`[AuthService.changePassword] Password changed successfully for user ID: ${userId}`);
    },
    async deleteAccount(userId) {
        // 1. Delete resident data
        const { error: residentError } = await (await Promise.resolve().then(() => __importStar(require('../config/supabase')))).supabase
            .from('resident')
            .delete()
            .eq('user_id', userId);
        if (residentError) {
            logger_1.default.error('[AuthService.deleteAccount] Error deleting resident data:', residentError.message);
        }
        // 2. Delete user data
        const success = await User_model_1.UserModel.deleteById(userId);
        if (!success) {
            throw new Error('Failed to delete user data');
        }
        // 3. Delete from Supabase Auth
        const { error: authError } = await supabase_1.supabase.auth.admin.deleteUser(userId);
        if (authError) {
            logger_1.default.warn(`[AuthService.deleteAccount] Failed to delete auth account for ${userId}: ${authError.message}`);
        }
        logger_1.default.info(`[AuthService.deleteAccount] Account deleted for user: ${userId}`);
    },
};
