/* eslint-disable no-new */
import config from './index';
import MongoDB from './mongo';

class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {
    new MongoDB(config.MONGO_URL);
  }

  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

export default DatabaseConnection;

