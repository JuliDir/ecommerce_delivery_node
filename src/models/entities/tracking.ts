import { Status } from '@dtos/enum/status.enum';
import { Document } from 'mongoose';

export interface TrackingDocument extends Tracking, Document {}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Tracking {
  deliveryId: string;
  status: Status;
  location?: Location;
  carrierId?: string | null;
  timestamp: Date;
}
