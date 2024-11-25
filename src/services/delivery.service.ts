import { CustomError } from '@config/errors/error.model';
import deliveryRepository from '@repositories/delivery.repository';
import trackingService from './tracking.service';
import { Rabbit } from 'src/rabbitmq/rabbit.server';
import { Status } from '@dtos/enum/status.enum';
import { DeliveryDocument } from '@models/entities/delivery';
import config from '@config/index';
import mongoose from 'mongoose';
import { Location } from '@models/entities/tracking';

class DeliveryService {

  // CU Iniciar entrega
  async startDelivery(orderId: string, shippingAddress: string) {
    if (!orderId) {
      throw new CustomError('Order ID is required', 400);
    }

    if (!shippingAddress) {
      throw new CustomError('Shipping address is required', 400);
    }

    const delivery = await deliveryRepository.create({
      orderId,
      shippingAddress,
      trackingNumber: `TN-${orderId}`,
      createdAt: new Date(),
      status: Status.IN_PREPARATION
    }) as DeliveryDocument;

    await trackingService.create({
      deliveryId: delivery._id as string,
      carrierId: null,
      status: Status.IN_PREPARATION,
      location: { latitude: -32.889458, longitude: -68.845838 },
      timestamp: new Date()
    });

    await this.updateDeliveryProjection(delivery._id as string);

    // Notificar el inicio de la entrega a la queue 'delivery_status_notifications'
    Rabbit.getInstance().sendMessage({
      orderId: delivery.orderId,
      status: Status.IN_PREPARATION,
      message: 'Delivery started successfully'
    }, config.QUEUE_DELIVERY_NOTIFICATIONS);

    return delivery;
  }

  async getDeliveryByIdOrTrackingNumber(deliveryIdOrTrackingNumber: string) {
    let delivery: DeliveryDocument | null = null;
    if (mongoose.Types.ObjectId.isValid(deliveryIdOrTrackingNumber)) {
      delivery = await this.getDeliveryById(deliveryIdOrTrackingNumber);
    } else {
      delivery = await deliveryRepository.getByTrackingNumber(deliveryIdOrTrackingNumber);
    }

    if (!delivery) {
      throw new CustomError('Delivery not found', 404);
    }

    return delivery;
  }

  //CU Consulta de un Delivery por ID
  async getDeliveryById(deliveryId: string) {
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      throw new CustomError('Invalid delivery ID format', 400);
    }

    const delivery = await deliveryRepository.getById(deliveryId);
    if (!delivery) {
      throw new CustomError('Delivery not found', 404);
    }

    return delivery;
  }

  // CU Actualizar proyección de un Delivery
  async updateDeliveryProjection(deliveryId: string) {
    const delivery = await this.getDeliveryById(deliveryId);
    if (!delivery) {
      throw new CustomError('Delivery not found', 404);
    }

    const lastTracking = await trackingService.getLastTrackingByDelivery(delivery);
    if (!lastTracking) {
      throw new CustomError('Tracking not found', 404);
    }

    const updatedDelivery = await deliveryRepository.updateById(deliveryId, {
      status: lastTracking.status,
      updated_at: new Date()
    });

    return updatedDelivery;
  }

  // CU Completar entrega
  async completeDelivery(deliveryId: string, location: Location, carrierId: string) {

    if (!location) {
      throw new CustomError('Location is required', 400);
    } else if (!location.latitude || !location.longitude) {
      throw new CustomError('Latitude and longitude are required', 400);
    }

    if (!deliveryId) throw new CustomError('Delivery ID is required', 400);
    const delivery = await this.getDeliveryById(deliveryId);

    // Si encuentro el lastTracking es porque el delivery no esta actualizado, sino, el delivery esta actualizado y tiene el ultimo status.
    let lastStatus = null;
    const lastTracking = await trackingService.getLastTrackingByDelivery(delivery);
    if (lastTracking) {
      lastStatus = lastTracking.status;
    } else {
      lastStatus = delivery.status;
    }

    if (lastStatus !== Status.NEAR_DESTIN) {
      throw new CustomError('Invalid status, the delivery must be in NEAR_DESTIN status', 400);
    }

    // Creo el nuevo tracking
    const newTracking = await trackingService.create({
      deliveryId,
      carrierId,
      status: Status.COMPLETED,
      location,
      timestamp: new Date()
    });

    // Actualizo la proyección del delivery
    await this.updateDeliveryProjection(deliveryId);

    // Notifico la completitud de la entrega a la queue 'delivery_status_notifications'
    Rabbit.getInstance().sendMessage({
      orderId: delivery.orderId,
      status: Status.COMPLETED,
      message: 'Delivery completed successfully'
    }, config.QUEUE_DELIVERY_NOTIFICATIONS);

    return newTracking;
  }

  // CU Entrega fallida
  async failDelivery(deliveryId: string, location: Location, carrierId: string) {
      
      if (!location) {
        throw new CustomError('Location is required', 400);
      } else if (!location.latitude || !location.longitude) {
        throw new CustomError('Latitude and longitude are required', 400);
      }
  
      if (!deliveryId) throw new CustomError('Delivery ID is required', 400);
      const delivery = await this.getDeliveryById(deliveryId);
  
      // Si encuentro el lastTracking es porque el delivery no esta actualizado, sino, el delivery esta actualizado y tiene el ultimo status.
      let lastStatus = null;
      const lastTracking = await trackingService.getLastTrackingByDelivery(delivery);
      if (lastTracking) {
        lastStatus = lastTracking.status;
      } else {
        lastStatus = delivery.status;
      }
  
      // Si la entrega ya se encuentra fallada o completada, no se puede volver a fallar
      if (lastStatus === Status.FAILED) {
        throw new CustomError('Invalid status, the delivery is already in FAILED status', 400);
      }
      if (lastStatus === Status.COMPLETED) {
        throw new CustomError('Invalid status, the delivery is already in COMPLETED status', 400);
      }
  
      // Creo el nuevo tracking
      const newTracking = await trackingService.create({
        deliveryId,
        carrierId,
        status: Status.FAILED,
        location,
        timestamp: new Date()
      });
  
      // Actualizo la proyección del delivery
      await this.updateDeliveryProjection(deliveryId);
  
      // Notifico la falla de la entrega a la queue 'delivery_status_notifications'
      Rabbit.getInstance().sendMessage({
        orderId: delivery.orderId,
        status: Status.FAILED,
        message: 'Delivery failed'
      }, config.QUEUE_DELIVERY_NOTIFICATIONS);
  
      return newTracking;
    
  }
}

export default new DeliveryService();
