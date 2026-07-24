import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getMessages, sendMessage } from '../controllers/messages.controller.js';

const router = Router();

router.get('/:id/messages', requireAuth, asyncHandler(getMessages));
router.post('/:id/messages', requireAuth, asyncHandler(sendMessage));

export default router;
