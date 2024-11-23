import { Tracking } from '@models/entities/tracking';
import { Request } from 'express';

export interface RequestCreateTracking extends Request {
  body: Tracking;
}


