import { Router } from 'express';
import {
  createContract,
  getContracts,
  getContractById,
  submitBid,
  awardContract,
} from '../controllers/contractController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Create contract (Admin only)
router.post('/', authenticate, requireRole(UserRole.ADMIN), createContract);

// List contracts (Admin & Contractors)
router.get('/', authenticate, getContracts);

// Get contract by ID
router.get('/:id', authenticate, getContractById);

// Submit bid (Contractor only)
router.post('/:id/bids', authenticate, requireRole(UserRole.CONTRACTOR), submitBid);

// Award contract (Admin only)
router.post('/:id/award', authenticate, requireRole(UserRole.ADMIN), awardContract);

export default router;
