import { Document } from 'mongoose';
import { Status } from '@dtos/enum/status.enum';

export interface DeliveryDocument extends Delivery, Document {}

export interface Delivery {
  status: Status;
  order_id: string;
  shipping_address: string;
  tracking_number: string;
  created_at: Date;
  updated_at?: Date;
}

