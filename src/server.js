import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/database.js';
import User from './models/User.js';
import datasetSyncService from './dataset/syncService.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connected');

    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.info('Trying to sync the dataset');
        const report = await datasetSyncService.sync();
        logger.info('Dataset sync report:', report);
      } catch (err) {
        logger.warn('Dataset sync skipped:', err.message);
      }
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
