import { NextFunction, Request, Response, Router } from 'express';
import trackingService from '@services/tracking.service';
import { RequestCreateTracking } from '@dtos/tracking.dto';
import { authMiddleware } from '@middlewares/auth.middleware';

class TrackingRoute {
  public router = Router();

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.post('/trackings', authMiddleware, this.updateTracking.bind(this));
    this.router.get('/trackings/:deliveryIdOrTrackingNumber', authMiddleware, this.getTrackingDetails.bind(this));
  }

  private updateTracking(req: Request, res: Response, next: NextFunction) {
    const { body } = req as RequestCreateTracking;
    const carrierId = req.user.id;

    trackingService
      .updateTracking(body, carrierId)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  } 

  private getTrackingDetails(req: Request, res: Response, next: NextFunction) {
    const {
      params: { deliveryIdOrTrackingNumber },
    } = req as any;
    trackingService
      .getTrackingDetails(deliveryIdOrTrackingNumber)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  }
}

export default new TrackingRoute().router;
