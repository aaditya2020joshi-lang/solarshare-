import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createRequest,
  getSellerRequests,
  getBuyerRequests,
  respondToRequest,
  cancelRequest,
} from '../controllers/requests.controller.js';

const router = Router();

router.post('/', requireAuth, requireRole('buyer'), asyncHandler(createRequest));
router.get('/mine', requireAuth, requireRole('buyer'), asyncHandler(getBuyerRequests));
router.get('/incoming', requireAuth, requireRole('seller'), asyncHandler(getSellerRequests));
router.put('/:id/respond', requireAuth, requireRole('seller'), asyncHandler(respondToRequest));
router.delete('/:id', requireAuth, requireRole('buyer'), asyncHandler(cancelRequest));

export default router;
