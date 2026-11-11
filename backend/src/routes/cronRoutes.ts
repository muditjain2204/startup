import { Router } from 'express';
import { triggerCronJob } from '../controllers/cronController';

const router = Router();

// Accept both GET and POST requests from external cron webhook services
router.get('/run', triggerCronJob);
router.post('/run', triggerCronJob);

export default router;

