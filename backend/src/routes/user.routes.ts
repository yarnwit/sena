import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

export default router;
