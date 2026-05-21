import logger from '../config/logger';

/**
 * Email notification service — placeholder
 * ในอนาคตจะเชื่อมต่อกับ email provider (e.g., SendGrid, Resend)
 */
export const EmailService = {
  async sendStatusUpdate(email: string, ticketNo: string, newStatus: string): Promise<void> {
    // TODO: Implement actual email sending
    logger.info(`[EMAIL] Status update notification sent to ${email} for ticket ${ticketNo}: ${newStatus}`);
  },

  async sendWelcome(email: string, username: string): Promise<void> {
    // TODO: Implement actual email sending
    logger.info(`[EMAIL] Welcome email sent to ${email} (${username})`);
  },

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    // TODO: Implement actual email sending
    logger.info(`[EMAIL] Password reset email sent to ${email}`);
  },
};
