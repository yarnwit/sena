"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
/**
 * Role-based access control middleware
 * แยกจาก auth.middleware.ts ตาม README.md structure
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
