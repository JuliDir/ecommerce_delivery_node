import amqp, { Channel, Connection } from 'amqplib';
import config from '@config/index';
import logger from '@utils/logger';
import { CustomError } from '@config/errors/error.model';

export class Rabbit {
  private static instance: Rabbit;
  private connection: Connection | null = null;
  private trainingChannel: Channel | null = null;

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
      throw new CustomError('Rabbit connection failed',500);
    }
    this.trainingChannel = await this.connection.createChannel();
    await this.trainingChannel.assertQueue(config.QUEUE_STATS);
  }

  public async sendMessage(message: any, queue = config.QUEUE_STATS): Promise<void> {
    if (!this.trainingChannel) {
      throw new CustomError('Rabbit connection failed',500);
    }
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      await this.trainingChannel.sendToQueue(queue, messageBuffer);
      logger.info(`--> Message sent to queue ${queue}`);
    } catch (err) {
      logger.error(`Error sending message to RabbitMQ: ${err}`);
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
