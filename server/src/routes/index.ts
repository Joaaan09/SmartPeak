import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import metricsRoutes from './metrics.routes.js';

const router = Router();

// Comprobación de salud del servicio
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/metrics', metricsRoutes);

export default router;
