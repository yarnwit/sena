import { Router } from 'express';
import { login, register, refresh, logout, forgotPassword, resetPassword, deleteAccount } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/account', deleteAccount);

export default router;
