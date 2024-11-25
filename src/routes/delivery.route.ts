import { NextFunction, Request, Response, Router } from 'express';
import deliveryService from '@services/delivery.service';
import { authMiddleware } from '@middlewares/auth.middleware';

class DeliveryRoute {
  public router = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.get('/deliveries/:deliveryIdOrTrackingNumber', authMiddleware, this.getDelivery.bind(this));
    this.router.put('/deliveries/:deliveryId/complete', authMiddleware, this.completeDelivery.bind(this));
    this.router.put('/deliveries/:deliveryId/failed', authMiddleware, this.failDelivery.bind(this));
  }

  private getDelivery(req: Request, res: Response, next: NextFunction) {
    const {
      params: { deliveryIdOrTrackingNumber },
    } = req as any;
    deliveryService
      .getDeliveryByIdOrTrackingNumber(deliveryIdOrTrackingNumber)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  }

  private completeDelivery(req: Request, res: Response, next: NextFunction) {
    const {
      params: { deliveryId },
    } = req as any;
    const { location } = req.body;
    const carrierId = req.user.id;

    deliveryService
      .completeDelivery(deliveryId, location, carrierId)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  }

  private failDelivery(req: Request, res: Response, next: NextFunction) {
    const {
      params: { deliveryId },
    } = req as any;
    const { location } = req.body;
    const carrierId = req.user.id;

    deliveryService
      .failDelivery(deliveryId, location, carrierId)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  }
  
}

export default new DeliveryRoute().router;
