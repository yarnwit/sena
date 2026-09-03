"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceMiddleware = void 0;
const supabase_1 = require("../config/supabase");
let isMaintenanceCache = null;
let lastCheckTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds
const maintenanceMiddleware = async (req, res, next) => {
    const now = Date.now();
    // 1. Check cache or query DB
    if (isMaintenanceCache === null || now - lastCheckTime > CACHE_TTL) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('system_settings')
                .select('is_maintenance')
                .limit(1)
                .maybeSingle();
            if (error) {
                // Fallback if table doesn't exist or other error
                isMaintenanceCache = process.env.MAINTENANCE_MODE === 'true';
            }
            else if (data) {
                isMaintenanceCache = data.is_maintenance;
            }
            else {
                isMaintenanceCache = process.env.MAINTENANCE_MODE === 'true';
            }
            lastCheckTime = now;
        }
        catch (err) {
            isMaintenanceCache = process.env.MAINTENANCE_MODE === 'true';
        }
    }
    // 2. Exception paths
    // Allow /api/auth/login so admins can still login, and allow /api/admin routes
    const isAuthOrAdmin = req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin');
    if (isMaintenanceCache && !isAuthOrAdmin) {
        return res.status(503).json({
            status: 'error',
            message: 'ระบบกำลังปิดปรับปรุง กรุณาเข้าใช้งานใหม่ในภายหลัง',
            code: 'MAINTENANCE_MODE'
        });
    }
    next();
};
exports.maintenanceMiddleware = maintenanceMiddleware;
