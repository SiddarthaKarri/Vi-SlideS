import express from 'express';
import { getSessionAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:sessionCode', protect, getSessionAnalytics);

export default router;
