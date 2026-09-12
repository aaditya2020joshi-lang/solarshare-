import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getVendors, getPanels, getPanelById } from '../controllers/panels.controller.js';

const router = Router();

router.get('/vendors', asyncHandler(getVendors));
router.get('/panels', asyncHandler(getPanels));
router.get('/panels/:id', asyncHandler(getPanelById));

export default router;
