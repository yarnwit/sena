import app from './app';
import { env } from './config/env';
import logger from './config/logger';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`=================================`);
  logger.info(`🚀 SENA Backend API`);
  logger.info(`=================================`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`=================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // In production you might want to close the server and exit process
});
