import { DeliveryDocument } from '@models/entities/delivery';
import TrackingModel from '@models/tracking';
import ModelTracking from '@models/tracking';
import { Tracking } from '@models/entities/tracking';

class TrackingRepository {

  async getTrackingsByDeliveryIdSortByTimestampAsc(deliveryId: string) {
    return TrackingModel.find({ 
      deliveryId,
    }).sort({ timestamp: 1 });
  }

  //Se busca el tracking donde su atributo timestamp sea mayor al atributo updatedAt de el Delivery, es decir, el último estado.
  async getLastTrackingByDelivery(delivery: DeliveryDocument) {
    return TrackingModel.findOne({
      deliveryId: delivery._id,
      timestamp: { $gte: delivery.updatedAt }
    });
  }

  async create(payload: Tracking) {
    return ModelTracking.create(payload);
  }
  
}

export default new TrackingRepository();
