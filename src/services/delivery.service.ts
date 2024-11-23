import { CustomError } from '@config/errors/error.model';
import deliveryRepository from '@repositories/delivery.repository';
import trackingService from './tracking.service';
import { Rabbit } from 'src/rabbitmq/rabbit.server';
import { Status } from '@dtos/enum/status.enum';
import { DeliveryDocument } from '@models/entities/delivery';
import config from '@config/index';

class DeliveryService {

  // CU Iniciar entrega
  async startDelivery(orderId: string, shippingAddress: string) {
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

    // Notificar el inicio de la entrega a la cola 'delivery_status_notifications'
    Rabbit.getInstance().sendMessage({
      orderId: delivery.orderId,
      status: Status.IN_PREPARATION,  
      message: 'Delivery started successfully'
    }, config.QUEUE_DELIVERY_NOTIFICATIONS);

    return delivery;
  }

  //CU Consulta de un Delivery por ID
  async getDeliveryById(deliveryId: string) {
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
  async completeDelivery(deliveryId: string, location: { latitude: number, longitude: number }) {
    const delivery = await this.getDeliveryById(deliveryId);
    if (delivery.status !== Status.NEAR_DESTIN) {
      throw new CustomError('Invalid status, the delivery must be in NEAR_DESTIN status', 400);
    }

    const lastTracking = await trackingService.getLastTrackingByDelivery(delivery);
    if (!lastTracking) {
      throw new CustomError('Tracking not found', 404);
    }

    const tracking = {
      deliveryId,
      carrierId: 'user_id',
      status: Status.COMPLETED,
      location,
      timestamp: new Date()
    };

    await trackingService.create(tracking);
    await this.updateDeliveryProjection(deliveryId);

    await Rabbit.getInstance().sendMessage({ orderId: delivery.orderId }, 'orders');

    return tracking;
  }

  // CU Entrega fallida
  async failDelivery(deliveryId: string, location: { latitude: number, longitude: number }) {
    const delivery = await this.getDeliveryById(deliveryId);
    if (delivery.status !== Status.NEAR_DESTIN) {
      throw new CustomError('Invalid status, the delivery must be in NEAR_DESTIN status', 400);
    }

    const lastTracking = await trackingService.getLastTrackingByDelivery(delivery);
    if (!lastTracking) {
      throw new CustomError('Tracking not found', 404);
    }

    const tracking = {
      deliveryId,
      carrierId: 'user_id',
      status: Status.FAILED,
      location,
      timestamp: new Date()
    };

    await trackingService.create(tracking);
    await this.updateDeliveryProjection(deliveryId);

    await Rabbit.getInstance().sendMessage({ orderId: delivery.orderId }, 'orders');

    return tracking;
  }
}

export default new DeliveryService();
