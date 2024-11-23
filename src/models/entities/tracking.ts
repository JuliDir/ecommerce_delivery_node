import { Status } from '@dtos/enum/status.enum';
import { Document } from 'mongoose';

export interface TrackingDocument extends Tracking, Document {}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Tracking {
  delivery_id: string;
  status: Status;
  location?: Location;
  carrier_id?: string | null;
  timestamp: Date;
}
