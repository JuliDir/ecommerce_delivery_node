import { Location } from '@models/entities/tracking';
import { Request } from 'express';

export interface RequestCreateTracking extends Request {
  body: CreateTracking;
}

export interface CreateTracking {
  deliveryId: string;
  status: string;
  location: Location;
}
