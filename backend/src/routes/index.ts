import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SENA API is running' });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
