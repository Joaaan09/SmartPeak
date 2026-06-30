import express, { Router } from 'express';
import { syncHealth } from '../controllers/sync.controller.js';
import { requireSyncToken } from '../middleware/syncAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// POST /api/sync/health — entrada del Atajo de iOS.
// Orden deliberado: autenticamos por token ANTES de parsear el body, para no
// gastar memoria parseando hasta 2mb de payload en peticiones sin token válido.
router.post(
  '/health',
  asyncHandler(requireSyncToken),
  express.json({ limit: '2mb' }),
  asyncHandler(syncHealth),
);

export default router;
