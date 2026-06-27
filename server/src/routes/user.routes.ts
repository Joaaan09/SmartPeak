import { Router } from 'express';
import { updateMe } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.patch('/me', requireAuth, asyncHandler(updateMe));

export default router;
