import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SENA API is running' });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);

export default router;
