"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNotFound = exports.formatForbidden = exports.formatUnauthorized = exports.formatValidationError = exports.formatError = void 0;
/**
 * Error view — standard response formatter for error responses
 */
const formatError = (message = 'Internal server error', errors = null) => {
    return {
        success: false,
        message,
        ...(errors ? { errors } : {}),
    };
};
exports.formatError = formatError;
const formatValidationError = (errors) => {
    return {
        success: false,
        message: 'Validation failed',
        errors,
    };
};
exports.formatValidationError = formatValidationError;
const formatUnauthorized = (message = 'Authentication required') => {
    return {
        success: false,
        message,
    };
};
exports.formatUnauthorized = formatUnauthorized;
const formatForbidden = (message = 'Access denied') => {
    return {
        success: false,
        message,
    };
};
exports.formatForbidden = formatForbidden;
const formatNotFound = (message = 'Resource not found') => {
    return {
        success: false,
        message,
    };
};
exports.formatNotFound = formatNotFound;
