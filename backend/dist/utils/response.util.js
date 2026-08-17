"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Standard success response format
 * ตาม AGENTS.md — คืนค่า Response ตามมาตรฐาน response.util.ts
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/**
 * Standard error response format
 */
const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {}),
    });
};
exports.sendError = sendError;
