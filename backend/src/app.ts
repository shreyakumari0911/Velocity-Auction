import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import mongoose from 'mongoose';

import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { sanitizeMongo } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';
import { initAuctionStatusJob } from './jobs/auctionStatusJob';

import authRoutes from './routes/auth.routes';
import auctionRoutes from './routes/auction.routes';
import adminRoutes from './routes/admin.routes';
import { initSockets } from './sockets/socketRegistry';

const app = express();
export const server = http.createServer(app);

// 1. Security & Core Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        // Allow all origins in dev for easier testing
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Request Logger & Sanitizers
app.use(requestLogger);
app.use(sanitizeMongo);

// 4. Rate Limiting — generous in dev so multi-tab bidding tests don't get 429'd
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// 5. Static uploads directory serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 6. API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auctions', auctionRoutes);
app.use('/api/v1/admin', adminRoutes);

// 7. Observability Endpoints

// Liveness & Readiness health checks
app.get('/health', async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  const status = mongoStatus === 'UP' ? 200 : 503;
  
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus
    }
  });
});

// 8. Global Error Handling Middleware
app.use(errorHandler);

// 9. Startup Logic
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
    
    // Start automated background scheduler jobs
    initAuctionStatusJob();

    // Initialize Socket.io WS Server
    initSockets(server);

    const PORT = env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  }
};

startServer().catch((err) => {
  logger.error(err as Error, 'Failed to start server');
});

export default app;
