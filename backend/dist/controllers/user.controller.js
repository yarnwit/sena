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
exports.updateProfile = exports.getProfile = void 0;
const User_model_1 = require("../models/User.model");
const complaint_service_1 = require("../services/complaint.service");
const response_util_1 = require("../utils/response.util");
const logger_1 = __importDefault(require("../config/logger"));
// ===== GET /api/users/profile =====
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
        const user = await User_model_1.UserModel.findById(userId);
        if (!user)
            return (0, response_util_1.sendError)(res, 'User not found', 404);
        const residentInfo = await complaint_service_1.ComplaintService.getResidentInfo(userId);
        return (0, response_util_1.sendSuccess)(res, {
            user_id: user.user_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            house_no: residentInfo.house_no,
            phone_number: residentInfo.phone_number,
            resident_type: residentInfo.resident_type,
            phase: residentInfo.phase,
            soi: residentInfo.soi,
        });
    }
    catch (error) {
        logger_1.default.error('Get profile error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getProfile = getProfile;
// ===== PATCH /api/users/profile =====
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
        const { first_name, last_name, house_no, phone_number, resident_type, phase, soi } = req.body;
        const success = await User_model_1.UserModel.updateProfile(userId, {
            ...(first_name && { first_name }),
            ...(last_name && { last_name }),
        });
        if (!success)
            return (0, response_util_1.sendError)(res, 'Failed to update profile');
        // Update resident table if resident fields are provided
        if (house_no || phone_number || resident_type || phase !== undefined || soi !== undefined) {
            const { supabase } = await Promise.resolve().then(() => __importStar(require('../config/supabase')));
            await supabase.from('resident').update({
                ...(house_no && { house_no }),
                ...(phone_number && { phone_number }),
                ...(resident_type && { resident_type }),
                ...(phase !== undefined && { phase }),
                ...(soi !== undefined && { soi }),
            }).eq('user_id', userId);
        }
        logger_1.default.info(`Profile updated for user: ${userId}`);
        return (0, response_util_1.sendSuccess)(res, null, 'อัปเดตโปรไฟล์สำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Update profile error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.updateProfile = updateProfile;
