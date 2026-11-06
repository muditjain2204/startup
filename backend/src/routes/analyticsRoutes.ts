import { Router } from 'express';
import { getDashboardOverview, getMapMarkers } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticate, getDashboardOverview);
router.get('/map-markers', getMapMarkers); // Accessible for public GIS view as well

export default router;
