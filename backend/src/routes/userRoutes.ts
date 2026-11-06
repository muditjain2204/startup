import { Router } from 'express';
import { getUsers, updateUserStatus } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', authenticate, requireRole(UserRole.ADMIN), getUsers);
router.patch('/:id/status', authenticate, requireRole(UserRole.ADMIN), updateUserStatus);

export default router;
