import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import logger from './config/logger';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// HTTP Request Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Routes
app.use('/api', apiRoutes);

// Error Handling Middleware (should be last)
app.use(errorHandler);

export default app;
