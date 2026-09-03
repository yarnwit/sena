"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatList = exports.formatCreated = exports.formatSuccess = void 0;
/**
 * Success view — standard response formatter for successful operations
 */
const formatSuccess = (data = null, message = 'Success') => {
    return {
        success: true,
        message,
        data,
    };
};
exports.formatSuccess = formatSuccess;
const formatCreated = (data = null, message = 'Created successfully') => {
    return {
        success: true,
        message,
        data,
    };
};
exports.formatCreated = formatCreated;
const formatList = (data, total) => {
    return {
        success: true,
        data,
        ...(total !== undefined && { total }),
    };
};
exports.formatList = formatList;
