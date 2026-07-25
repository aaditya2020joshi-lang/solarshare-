import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createPanelOrder,
  getMyPanelOrders,
  getPanelOrderById,
  verifyPanelOrderPayment,
} from '../controllers/panelOrders.controller.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createPanelOrder));
router.get('/mine', requireAuth, asyncHandler(getMyPanelOrders));
router.get('/:id', requireAuth, asyncHandler(getPanelOrderById));
router.post('/:id/verify-payment', requireAuth, asyncHandler(verifyPanelOrderPayment));

export default router;
