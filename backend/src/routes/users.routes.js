import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getProfile, updateProfile } from '../controllers/users.controller.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getProfile));
router.put('/me', requireAuth, asyncHandler(updateProfile));

export default router;
