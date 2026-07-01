import cron from 'node-cron';
import { Auction } from '../models/Auction';
import { getIoInstance } from '../sockets/socketRegistry';
import { logger } from '../utils/logger';

export const initAuctionStatusJob = (): void => {
  // Execute every 15 seconds
  cron.schedule('*/15 * * * * *', async () => {
    const now = new Date();
    
    try {
      // 1. Transition Scheduled -> Live
      const startingAuctions = await Auction.find({
        status: 'scheduled',
        startTime: { $lte: now }
      });

      for (const auction of startingAuctions) {
        auction.status = 'live';
        await auction.save();
        logger.info(`⚙️ Auto-scheduler: Started Auction ${auction._id} (Status set to Live)`);

        // Emit live update
        const io = getIoInstance();
        if (io) {
          io.to(`auction:${auction._id}`).emit('auction_status_change', {
            auctionId: auction._id.toString(),
            status: 'live'
          });
        }
      }

      // 2. Transition Live -> Ended / Sold
      const expiredLiveAuctions = await Auction.find({
        status: 'live',
        endTime: { $lte: now }
      });

      for (const auction of expiredLiveAuctions) {
        if (auction.highestBid && auction.highestBidAmount >= auction.reservePrice) {
          auction.status = 'sold';
        } else {
          auction.status = 'ended';
        }
        await auction.save();
        
        logger.info(
          `⚙️ Auto-scheduler: Completed Auction ${auction._id}. Status set to "${auction.status}" ` +
          `(Final bid: ${auction.highestBidAmount}, Reserve: ${auction.reservePrice})`
        );

        // Emit ended / sold update
        const io = getIoInstance();
        if (io) {
          io.to(`auction:${auction._id}`).emit('auction_status_change', {
            auctionId: auction._id.toString(),
            status: auction.status
          });
        }
      }
    } catch (error) {
      logger.error(error as Error, '❌ Auto-scheduler: Error during status transitions');
    }
  });
};
