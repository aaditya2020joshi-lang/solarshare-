import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getMyDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(getMyDashboard));

export default router;
