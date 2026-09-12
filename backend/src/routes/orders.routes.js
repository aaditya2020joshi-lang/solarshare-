import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createOrder, getOrder, verifyPayment, getAdminOrders } from '../controllers/orders.controller.js';

const router = Router();

router.post('/', asyncHandler(createOrder));
router.get('/admin', asyncHandler(getAdminOrders));
router.get('/:id', asyncHandler(getOrder));
router.post('/:id/verify-payment', asyncHandler(verifyPayment));

export default router;
