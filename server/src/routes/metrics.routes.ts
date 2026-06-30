import { Router } from 'express';
import { getLatestMetrics } from '../controllers/metrics.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/latest', requireAuth, asyncHandler(getLatestMetrics));

export default router;
