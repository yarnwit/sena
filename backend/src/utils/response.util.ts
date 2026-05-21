import { Response } from 'express';

/**
 * Standard success response format
 * ตาม AGENTS.md — คืนค่า Response ตามมาตรฐาน response.util.ts
 */
export const sendSuccess = (
  res: Response,
  data: unknown = null,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response format
 */
export const sendError = (
  res: Response,
  message: string = 'Internal server error',
  statusCode: number = 500,
  errors: unknown = null
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
