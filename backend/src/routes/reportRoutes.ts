import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  verifyReport,
  mergeReports,
} from '../controllers/reportController';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

// Create report: can be authenticated user or anonymous citizen scanning QR
router.post('/', optionalAuthenticate, upload.array('files', 5), createReport);

// List reports: public/citizen/admin
router.get('/', optionalAuthenticate, getReports);

// Get report by ID
router.get('/:id', optionalAuthenticate, getReportById);

// Verify/reject report (Admin only)
router.patch('/:id/verify', authenticate, requireRole(UserRole.ADMIN), verifyReport);

// Merge duplicate report (Admin only)
router.post('/:id/merge', authenticate, requireRole(UserRole.ADMIN), mergeReports);

export default router;

