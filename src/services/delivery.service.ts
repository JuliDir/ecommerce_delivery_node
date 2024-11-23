import { CustomError } from '@config/errors/error.model';
import deliveryRepository from '@repositories/delivery.repository';
import trackingService from './tracking.service';
import { Rabbit } from 'src/rabbitmq/rabbit.server';
import { Status } from '@dtos/enum/status.enum';

class DeliveryService {

  // CU Iniciar entrega
  async startDelivery(orderId: string, shippingAddress: string) {
    if (!shippingAddress) {
      throw new CustomError('Shipping address is required', 400);
    }

    const trackingNumber = `TN-${orderId}`;
    const delivery = await deliveryRepository.create({
      order_id: orderId,
      shipping_address: shippingAddress,
      tracking_number: trackingNumber,
      created_at: new Date(),
      status: Status.IN_PREPARATION
    }) as { _id: string };

    await trackingService.create({
      delivery_id: delivery._id,
      carrier_id: null,
      status: Status.IN_PREPARATION,
      location: { latitude: -32.889458, longitude: -68.845838 },
      timestamp: new Date()
    });

    await this.updateDeliveryProjection(delivery._id);

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
      delivery_id: deliveryId,
      carrier_id: 'user_id',
      status: Status.DELIVERED,
      location,
      timestamp: new Date()
    };

    await trackingService.create(tracking);
    await this.updateDeliveryProjection(deliveryId);

    await Rabbit.getInstance().sendMessage({ orderId: delivery.order_id }, 'orders');

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
      delivery_id: deliveryId,
      carrier_id: 'user_id',
      status: Status.FAILED,
      location,
      timestamp: new Date()
    };

    await trackingService.create(tracking);
    await this.updateDeliveryProjection(deliveryId);

    await Rabbit.getInstance().sendMessage({ orderId: delivery.order_id }, 'orders');

    return tracking;
  }
}

export default new DeliveryService();
