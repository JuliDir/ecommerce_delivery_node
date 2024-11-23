import { Router } from 'express';
import deliveryRoute from './delivery.route';
import trackingRoute from './tracking.route';

const router = Router();

router.use(deliveryRoute);
router.use(trackingRoute);

export default router;
