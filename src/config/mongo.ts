import logger from '@utils/logger';
import mongoose, { ConnectOptions } from 'mongoose';

class MongoDB {
  options: ConnectOptions = {
    autoIndex: false, // Don't build indexes
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };

  constructor(url = 'mongodb://localhost:27017/product-db') {
    try{
      mongoose.connect(url, this.options);
      logger.info("Database connect")
    }
    catch(err) {
      logger.error(err)
    }
  }
}
export default MongoDB;
