"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Email notification service — placeholder
 * ในอนาคตจะเชื่อมต่อกับ email provider (e.g., SendGrid, Resend)
 */
exports.EmailService = {
    async sendStatusUpdate(email, ticketNo, newStatus) {
        // TODO: Implement actual email sending
        logger_1.default.info(`[EMAIL] Status update notification sent to ${email} for ticket ${ticketNo}: ${newStatus}`);
    },
    async sendWelcome(email, username) {
        // TODO: Implement actual email sending
        logger_1.default.info(`[EMAIL] Welcome email sent to ${email} (${username})`);
    },
    async sendPasswordReset(email, resetLink) {
        // TODO: Implement actual email sending
        logger_1.default.info(`[EMAIL] Password reset email sent to ${email}`);
    },
};
