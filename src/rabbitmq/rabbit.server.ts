import amqp, { Channel, Connection } from 'amqplib';
import config from '@config/index';
import logger from '@utils/logger';
import { CustomError } from '@config/errors/error.model';
import deliveryService from '@services/delivery.service';
import { Status } from '@dtos/enum/status.enum';

export class Rabbit {
  private static instance: Rabbit;
  private connection: Connection | null = null;
  private deliveryChannel: Channel | null = null;

  private constructor() {
    this.connect();
  }

  public static getInstance(): Rabbit {
    if (!Rabbit.instance) {
      Rabbit.instance = new Rabbit();
    }
    return Rabbit.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.RABBIT_URL);
      this.connection.on('close', () => this.handleConnectionClose());
      this.connection.on('error', (err) => this.handleConnectionError(err));
      await this.setupChannels();
      logger.info('🚀 Connected to RabbitMQ');
    } catch (err) {
      logger.error(`Error connecting to RabbitMQ: ${err}`);
      this.retryConnection();
    }
  }

  private async setupChannels(): Promise<void> {
    if (!this.connection) {
      throw new CustomError('Rabbit connection failed', 500);
    }
    this.deliveryChannel = await this.connection.createChannel();
    await this.deliveryChannel.assertQueue(config.QUEUE_ORDERS_REQUEST); // Cola para recibir solicitudes de entrega
    await this.deliveryChannel.assertQueue(config.QUEUE_DELIVERY_NOTIFICATIONS); // Cola para notificar el estado de la entrega

     // Consumir los mensajes de la cola de solicitudes de entrega
     this.deliveryChannel.consume(config.QUEUE_ORDERS_REQUEST, this.handleOrderDeliveryRequest, { noAck: true });
  }

  public async sendMessage(message: any, queue: string): Promise<void> {
    if (!this.deliveryChannel) {
      throw new CustomError('Rabbit connection failed', 500);
    }
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      await this.deliveryChannel.sendToQueue(queue, messageBuffer);
      logger.info(`--> Message sent to queue ${queue}`);
    } catch (err) {
      logger.error(`Error sending message to RabbitMQ: ${err}`);
    }
  }

  private async handleOrderDeliveryRequest(msg: amqp.ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    const { orderId, userId, shippingAddress } = JSON.parse(msg.content.toString());
    logger.info(`Received delivery request for order: ${orderId}`);
    
    try {
      const delivery = await deliveryService.startDelivery(orderId, userId, shippingAddress);
      logger.info(`Delivery started for order: ${orderId}, tracking number: ${delivery.trackingNumber}`);
    } catch (error) {
      Rabbit.getInstance().sendMessage({
        orderId,
        status: Status.FAILED,
        message: error.message || 'Delivery failed to start'
      }, config.QUEUE_DELIVERY_NOTIFICATIONS);
      
      logger.error(`Failed to start delivery for order: ${orderId}. Error: ${error.message}`);
    }
  }

  private handleConnectionClose(): void {
    logger.error('Connection to RabbitMQ closed');
    this.retryConnection();
  }

  private handleConnectionError(err: Error): void {
    logger.error(`Connection error to RabbitMQ: ${err}`);
    this.retryConnection();
  }

  private retryConnection(): void {
    setTimeout(() => {
      this.connect().catch((err) => {
        logger.error(`Error retrying connection to RabbitMQ: ${err}`);
      });
    }, 5000);
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}
