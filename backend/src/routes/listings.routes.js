import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createListing,
  getListings,
  getSellerListings,
  getListingById,
  closeListing,
  deleteListing,
} from '../controllers/listings.controller.js';

const router = Router();

router.get('/', asyncHandler(getListings));
router.get('/mine', requireAuth, requireRole('seller'), asyncHandler(getSellerListings));
router.get('/:id', asyncHandler(getListingById));
router.post('/', requireAuth, requireRole('seller'), asyncHandler(createListing));
router.put('/:id/close', requireAuth, requireRole('seller'), asyncHandler(closeListing));
router.delete('/:id', requireAuth, requireRole('seller'), asyncHandler(deleteListing));

export default router;
