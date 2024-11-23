import { Document } from 'mongoose';
import { Status } from '@dtos/enum/status.enum';

export interface DeliveryDocument extends Delivery, Document {}

export interface Delivery {
  status: Status;
  orderId: string;
  shippingAddress: string;
  trackingNumber: string;
  createdAt: Date;
  updatedAt?: Date;
}

