import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(error as Error, '❌ Error connecting to MongoDB');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error(error as Error, 'Error disconnecting MongoDB');
  }
};
