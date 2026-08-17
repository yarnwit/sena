"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const complaint_routes_1 = __importDefault(require("./complaint.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'SENA API is running' });
});
// API Routes
router.use('/auth', auth_routes_1.default);
router.use('/complaints', complaint_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/admin', admin_routes_1.default);
exports.default = router;
