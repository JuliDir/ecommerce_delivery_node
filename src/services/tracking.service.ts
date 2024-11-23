import { CustomError } from '@config/errors/error.model';
import trackingRepository from '@repositories/tracking.repository';
import deliveryService from './delivery.service';
import { DeliveryDTO } from '@dtos/delivery.dto';
import { Tracking } from '@models/entities/tracking';
import { Status } from '@dtos/enum/status.enum';
import { DeliveryDocument } from '@models/entities/delivery';

class TrackingService {

  async create(payload: Tracking) {
    return trackingRepository.create(payload);
  }

  // CU Consulta de tracking de una entrega
  async getTrackingDetails(deliveryId: string): Promise<DeliveryDTO> {
    const delivery = await deliveryService.getDeliveryById(deliveryId);
    const trackings = await trackingRepository.getTrackingsByDeliveryIdSortByTimestampAsc(deliveryId);
    return {
      deliveryId,
      trackingNumber: delivery.trackingNumber,
      trackingDetails: trackings
    };
  }

  // CU Actualización de tracking de una entrega
  async updateTracking(payload: Tracking) {
    const delivery = await deliveryService.getDeliveryById(payload.deliveryId);
    if (!delivery) {
      throw new CustomError('Delivery not found', 404);
    }

    const trackings = await trackingRepository.getTrackingsByDeliveryIdSortByTimestampAsc(payload.deliveryId);
    const lastTracking = trackings[trackings.length - 1];

    switch (lastTracking.status) {
      case Status.IN_PREPARATION:
        if (payload.status === Status.IN_TRANSIT) {
          return trackingRepository.create(payload);
        } else {
          throw new CustomError('Invalid status, the next status must be IN_TRANSIT', 400);
        }
      case Status.IN_TRANSIT:
        if (payload.status === Status.IN_TRANSIT || payload.status === Status.NEAR_DESTIN) {
          return trackingRepository.create(payload);
        } else {
          throw new CustomError('Invalid status, the next status must be IN_TRANSIT or NEAR_DESTIN', 400);
        }
      default:
        throw new CustomError('Invalid status', 400);
    }
  }

  async getLastTrackingByDelivery(delivery: DeliveryDocument) {
    return trackingRepository.getLastTrackingByDelivery(delivery);
  }
}

export default new TrackingService();
