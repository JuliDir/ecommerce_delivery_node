import { model, Schema } from 'mongoose';
import { TrackingDocument } from './entities/tracking';

export const TrackingSchema = new Schema<TrackingDocument>(
  {
    delivery_id: { type: String, required: true },
    status: { type: String, required: true, enum: ['IN_PREPARATION', 'IN_TRANSIT', 'NEAR_DESTIN','DELIVERED', 'FAILED'] },
    location: { type: { latitude: Number, longitude: Number }, required: true },
    carrier_id: { type: String, required: false },
    timestamp: { type: Date, required: true },
  },
  {
    collection: 'trackings',
  }
);

const ModelTracking = model<TrackingDocument>('Tracking', TrackingSchema);
export default ModelTracking;
