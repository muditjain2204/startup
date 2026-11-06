import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  updateProjectStatus,
  addProjectUpdate,
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id/status', authenticate, updateProjectStatus);
router.post('/:id/updates', authenticate, upload.array('updatePhoto', 4), addProjectUpdate);

export default router;
