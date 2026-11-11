import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRByCode,
  recordScan,
} from '../controllers/qrController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Generate QR code (Admin only)
router.post('/generate', authenticate, requireRole(UserRole.ADMIN), createQRCode);

// List active QR stations
router.get('/', getQRCodes);

// Public scan and query
router.get('/:code', getQRByCode);
router.post('/:code/scan', recordScan);

export default router;

