import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { bidService } from '../services/BidService';
import { userRepository } from '../repositories/UserRepository';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: 'user' | 'admin';
  };
}

let ioInstance: Server | null = null;

export const initSockets = (server: http.Server): Server => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust for strict production domains if needed
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance = io;

  // Handshake authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.query.token as string;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.warn(`Socket connection rejected: ${(error as Error).message}`);
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.user?.userId})`);

    // Clients join specific room when viewing an auction's details
    socket.on('join_auction', (auctionId: string) => {
      socket.join(`auction:${auctionId}`);
      logger.debug(`Socket ${socket.id} joined room: auction:${auctionId}`);
    });

    socket.on('leave_auction', (auctionId: string) => {
      socket.leave(`auction:${auctionId}`);
      logger.debug(`Socket ${socket.id} left room: auction:${auctionId}`);
    });

    // Real-time Bidding Event
    socket.on('place_bid', async (data: { auctionId: string; amount: number }) => {
      const userId = socket.user?.userId;
      if (!userId) {
        socket.emit('bid_error', { message: 'Unauthorized user credentials' });
        return;
      }

      try {
        const { bid, auction } = await bidService.placeBid(userId, data.auctionId, data.amount);
        const bidderDetails = await userRepository.findById(userId);
        const bidderName = bidderDetails?.name || 'Anonymous';

        // Broadcast the bid update to all watchers in the room
        io.to(`auction:${data.auctionId}`).emit('bid_update', {
          auctionId: data.auctionId,
          bidId: bid._id,
          bidderName,
          amount: bid.amount,
          timestamp: bid.timestamp.toISOString()
        });

        // Broadcast general status change
        io.to(`auction:${data.auctionId}`).emit('auction_status_change', {
          auctionId: data.auctionId,
          status: auction.status
        });
      } catch (error) {
        socket.emit('bid_error', { message: (error as Error).message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Expose helper to broadcast events from other server files (like cron schedulers)
 */
export const getIoInstance = (): Server | null => {
  return ioInstance;
};
