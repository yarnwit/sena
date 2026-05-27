import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { getUsers, createUser, updateUser, deleteUser, getReports, getAuditLogs } from '../controllers/admin.controller';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);
router.get('/logs', getAuditLogs);

export default router;
