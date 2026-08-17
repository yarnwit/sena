"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require admin role
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)('admin'));
router.get('/users', admin_controller_1.getUsers);
router.post('/users', admin_controller_1.createUser);
router.patch('/users/:id', admin_controller_1.updateUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.get('/reports', admin_controller_1.getReports);
router.get('/logs', admin_controller_1.getAuditLogs);
router.get('/settings', admin_controller_1.getSystemSettings);
router.put('/settings', admin_controller_1.updateSystemSettings);
exports.default = router;
