import { model, Schema } from 'mongoose';
import { DeliveryDocument } from './entities/delivery';

export const DeliverySchema = new Schema(
  {
    status: { type: String, required: true, enum: ['IN_PREPARATION', 'IN_TRANSITION', 'NEAR_DESTIN','COMPLETED', 'FAILED'] },
    orderId: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    trackingNumber: { type: String, required: true },
  },
  {
    collection: 'deliveries',
    timestamps: true, 
  }
);

const ModelDelivery = model<DeliveryDocument>('Delivery', DeliverySchema);
export default ModelDelivery;