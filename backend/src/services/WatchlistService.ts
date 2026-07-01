import { watchlistRepository } from '../repositories/WatchlistRepository';
import { IWatchlist } from '../models/Watchlist';
import { logger } from '../utils/logger';

export class WatchlistService {
  async getWatchlist(userId: string): Promise<IWatchlist> {
    let watchlist = await watchlistRepository.findByUserId(userId);
    if (!watchlist) {
      watchlist = await watchlistRepository.create(userId);
    }
    return watchlist;
  }

  async addToWatchlist(userId: string, auctionId: string): Promise<IWatchlist> {
    const updated = await watchlistRepository.addToWatchlist(userId, auctionId);
    if (!updated) {
      throw new Error('Failed to add to watchlist');
    }
    logger.info(`Added auction ${auctionId} to watchlist for user ${userId}`);
    return updated;
  }

  async removeFromWatchlist(userId: string, auctionId: string): Promise<IWatchlist> {
    const updated = await watchlistRepository.removeFromWatchlist(userId, auctionId);
    if (!updated) {
      throw new Error('Failed to remove from watchlist');
    }
    logger.info(`Removed auction ${auctionId} from watchlist for user ${userId}`);
    return updated;
  }
}

export const watchlistService = new WatchlistService();
