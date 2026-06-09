import cors from 'cors';
import { env } from './env';

export const corsOptions: cors.CorsOptions = {
  origin: [env.CORS_ORIGIN, 'http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
