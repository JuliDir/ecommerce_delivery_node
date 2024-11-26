import { CustomError } from '@config/errors/error.model';
import trackingRepository from '@repositories/tracking.repository';
import deliveryService from './delivery.service';
import { DeliveryDTO } from '@dtos/delivery.dto';
import { Tracking } from '@models/entities/tracking';
import { Status } from '@dtos/enum/status.enum';
import { DeliveryDocument } from '@models/entities/delivery';
import { CreateTracking } from '@dtos/tracking.dto';
import mongoose from 'mongoose';

class TrackingService {

  async create(payload: Tracking) {
    return trackingRepository.create(payload);
  }

  // CU Consulta de tracking de una entrega
  async getTrackingDetails(deliveryIdOrTrackingNumber: string): Promise<DeliveryDTO> {
    let delivery: DeliveryDocument | null = null;
    if (mongoose.Types.ObjectId.isValid(deliveryIdOrTrackingNumber)) {
      delivery = await deliveryService.getDeliveryById(deliveryIdOrTrackingNumber);
    } else {
      delivery = await deliveryService.getDeliveryByTrackingNumber(deliveryIdOrTrackingNumber);
    }

    if (!delivery) {
      throw new CustomError('Delivery not found', 404);
    }

    const trackings = await trackingRepository.getTrackingsByDeliveryIdSortByTimestampAsc(delivery._id as string);
    return {
      deliveryId: delivery._id as string,
      trackingNumber: delivery.trackingNumber,
      trackingDetails: trackings
    };
  }

  // CU Actualización de tracking de una entrega
  async updateTracking(payload: CreateTracking, carrierId: string) {

    if (!payload.deliveryId) throw new CustomError('Delivery ID is required', 400);
    const delivery = await deliveryService.getDeliveryById(payload.deliveryId);

    if (!payload.location) {
      throw new CustomError('Location is required', 400);
    } else if (!payload.location.latitude || !payload.location.longitude) {
      throw new CustomError('Latitude and longitude are required', 400);
    }

    if (!payload.status) throw new CustomError('Status is required', 400);

    // Si encuentro el lastTracking es porque el delivery no esta actualizado, sino, el delivery esta actualizado y tiene el ultimo status.
    let lastStatus = null;
    const lastTracking = await trackingRepository.getLastTrackingByDelivery(delivery);
    if (lastTracking) {
      lastStatus = lastTracking.status;
    } else {
      lastStatus = delivery.status;
    }

    switch (delivery.status) {
      case Status.IN_PREPARATION:
        if (payload.status === Status.IN_TRANSIT) {
          break;
        } else {
          throw new CustomError('Invalid status, the next status must be IN_TRANSIT', 400);
        }
      case Status.FAILED:
        if (payload.status === Status.IN_TRANSIT) {
          break;
        } else {
          throw new CustomError('Invalid status, the next status must be IN_TRANSIT', 400);
        }
      case Status.IN_TRANSIT:
        if (payload.status === Status.IN_TRANSIT || payload.status === Status.NEAR_DESTIN) {
          break;
        } else {
          throw new CustomError('Invalid status, the next status must be IN_TRANSIT or NEAR_DESTIN', 400);
        }
      default:
        throw new CustomError('Invalid status, the delivery must be in IN_PREPARATION or IN_TRANSIT status', 400);
    }

    // Creo el nuevo tracking
    const newTracking = trackingRepository.create({
      deliveryId: payload.deliveryId,
      carrierId: carrierId,
      status: Status[payload.status as keyof typeof Status],
      location: payload.location,
      timestamp: new Date()
    });

    // Actualizo la proyección del delivery
    deliveryService.updateDeliveryProjection(payload.deliveryId);
    return newTracking;
  }

  async getLastTrackingByDelivery(delivery: DeliveryDocument) {
    return trackingRepository.getLastTrackingByDelivery(delivery);
  }
}

export default new TrackingService();
