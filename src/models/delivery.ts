import { model, Schema } from 'mongoose';
import { DeliveryDocument } from './entities/delivery';

export const DeliverySchema = new Schema(
  {
    status: { type: String, required: true, enum: ['IN_PREPARATION', 'IN_TRANSITION', 'NEAR_DESTIN','DELIVERED', 'FAILED'] },
    order_id: { type: String, required: true },
    shipping_address: { type: String, required: true },
    tracking_number: { type: String, required: true },
  },
  {
    collection: 'deliveries',
    timestamps: true, 
  }
);

const ModelDelivery = model<DeliveryDocument>('Delivery', DeliverySchema);
export default ModelDelivery;