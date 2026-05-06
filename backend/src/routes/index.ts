import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SENA API is running' });
});

// API Routes
router.use('/auth', authRoutes);

export default router;
