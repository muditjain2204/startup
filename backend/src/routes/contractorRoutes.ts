import { Router } from 'express';
import {
  getContractors,
  getContractorById,
  updateContractorStatus,
} from '../controllers/contractorController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// List contractors (Admin only)
router.get('/', authenticate, requireRole(UserRole.ADMIN), getContractors);

// Get single contractor details
router.get('/:id', authenticate, getContractorById);

// Update verification status (Admin only)
router.patch('/:id/status', authenticate, requireRole(UserRole.ADMIN), updateContractorStatus);

export default router;
