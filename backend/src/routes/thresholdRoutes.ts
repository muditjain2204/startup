import { Router } from 'express';
import { getThresholds, updateThresholds } from '../controllers/thresholdController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getThresholds);
router.put('/', authenticate, requireRole(UserRole.ADMIN), updateThresholds);

export default router;
