import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getUsers, getListings, getStats } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(getUsers));
router.get('/listings', asyncHandler(getListings));
router.get('/stats', asyncHandler(getStats));

export default router;
