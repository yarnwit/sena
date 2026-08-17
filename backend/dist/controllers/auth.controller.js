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
exports.deleteAccount = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.register = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const response_util_1 = require("../utils/response.util");
const logger_1 = __importDefault(require("../config/logger"));
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await auth_service_1.AuthService.login(username, password);
        return (0, response_util_1.sendSuccess)(res, {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        }, 'Login successful');
    }
    catch (error) {
        if (error.message === 'Invalid credentials') {
            logger_1.default.warn(`[AuthController.login] Controller caught Invalid credentials for: ${req.body.username}`);
            return (0, response_util_1.sendError)(res, 'Invalid credentials', 401);
        }
        logger_1.default.error('[AuthController.login] Login error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const result = await auth_service_1.AuthService.register(req.body);
        logger_1.default.info(`[AuthController.register] New user registered: ${req.body.email}`);
        return (0, response_util_1.sendSuccess)(res, result, 'Registration successful', 201);
    }
    catch (error) {
        logger_1.default.error('[AuthController.register] Registration error:', error);
        return (0, response_util_1.sendError)(res, error.message || 'Internal server error', 400);
    }
};
exports.register = register;
const refresh = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return (0, response_util_1.sendError)(res, 'Refresh token required', 401);
        }
        const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.AuthService.refreshToken(refreshToken);
        return (0, response_util_1.sendSuccess)(res, { accessToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        return (0, response_util_1.sendError)(res, 'Invalid or expired refresh token', 401);
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        await auth_service_1.AuthService.logout();
        return (0, response_util_1.sendSuccess)(res, null, 'Logout successful');
    }
    catch (error) {
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    try {
        const { username, first_name, last_name } = req.body;
        const resetToken = await auth_service_1.AuthService.verifyIdentity(username, first_name, last_name);
        return (0, response_util_1.sendSuccess)(res, { resetToken }, 'ยืนยันตัวตนสำเร็จ กรุณาตั้งรหัสผ่านใหม่');
    }
    catch (error) {
        if (error.message === 'ไม่พบชื่อผู้ใช้งานในระบบ') {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
        if (error.message === 'ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้') {
            return (0, response_util_1.sendError)(res, 'ข้อมูลไม่ตรงกับที่ลงทะเบียนไว้ กรุณาตรวจสอบอีกครั้ง', 403);
        }
        logger_1.default.error('[AuthController.forgotPassword] Forgot password error:', error);
        return (0, response_util_1.sendError)(res, 'เกิดข้อผิดพลาดภายในระบบ');
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        await auth_service_1.AuthService.resetPassword(resetToken, newPassword);
        return (0, response_util_1.sendSuccess)(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
    }
    catch (error) {
        if (error.message.includes('หมดอายุ') || error.message.includes('ไม่ถูกต้อง')) {
            return (0, response_util_1.sendError)(res, error.message, 401);
        }
        logger_1.default.error('[AuthController.resetPassword] Reset password error:', error);
        return (0, response_util_1.sendError)(res, 'เกิดข้อผิดพลาดภายในระบบ');
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
        }
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return (0, response_util_1.sendError)(res, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 400);
        }
        await auth_service_1.AuthService.changePassword(userId, newPassword);
        return (0, response_util_1.sendSuccess)(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
    }
    catch (error) {
        logger_1.default.error('[AuthController.changePassword] Change password error:', error);
        return (0, response_util_1.sendError)(res, 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
};
exports.changePassword = changePassword;
const deleteAccount = async (req, res) => {
    try {
        const { supabase } = await Promise.resolve().then(() => __importStar(require('../config/supabase')));
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return (0, response_util_1.sendError)(res, 'Authentication token required', 401);
        }
        const { data: { user: authUser }, error: verifyError } = await supabase.auth.getUser(token);
        if (verifyError || !authUser) {
            return (0, response_util_1.sendError)(res, 'Invalid or expired token', 401);
        }
        await auth_service_1.AuthService.deleteAccount(authUser.id);
        return (0, response_util_1.sendSuccess)(res, null, 'Account deleted successfully');
    }
    catch (error) {
        logger_1.default.error('[AuthController.deleteAccount] Delete account error:', error);
        return (0, response_util_1.sendError)(res, error.message || 'Internal server error');
    }
};
exports.deleteAccount = deleteAccount;
