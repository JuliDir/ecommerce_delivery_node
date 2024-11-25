import ModelDelivery from '@models/delivery';
import { UpdateDelivery } from '@dtos/delivery.dto';
import { Delivery } from '@models/entities/delivery';

class DeliveryRepository {
  async getById(deliveryId: string) {
    return ModelDelivery.findById(deliveryId);
  }

  async getByTrackingNumber(trackingNumber: string) {
    return ModelDelivery.findOne({
      trackingNumber,
    });
  }

  async create(payload: Delivery) {
    return ModelDelivery.create(payload);
  }

  async updateById(discountId: string, payload: UpdateDelivery) {
    return ModelDelivery.findOneAndUpdate({ _id: discountId }, payload, { new: true });
  }
}

export default new DeliveryRepository();
