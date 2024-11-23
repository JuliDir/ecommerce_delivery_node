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
    this.router.get('/trackings/:deliveryId', authMiddleware, this.getTrackingDetails.bind(this));
  }

  private updateTracking(req: Request, res: Response, next: NextFunction) {
    const { body } = req as RequestCreateTracking;
    trackingService
      .updateTracking(body)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  } 

  private getTrackingDetails(req: Request, res: Response, next: NextFunction) {
    const {
      params: { deliveryId },
    } = req as any;
    trackingService
      .getTrackingDetails(deliveryId)
      .then((response) => res.json(response))
      .catch((err) => next(err));
  }
}

export default new TrackingRoute().router;
