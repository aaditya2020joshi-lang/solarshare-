import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getSellerDashboard, getBuyerDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/seller', requireAuth, requireRole('seller'), asyncHandler(getSellerDashboard));
router.get('/buyer', requireAuth, requireRole('buyer'), asyncHandler(getBuyerDashboard));

export default router;
