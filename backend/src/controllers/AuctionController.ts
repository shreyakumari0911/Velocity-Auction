import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { auctionService } from '../services/AuctionService';
import { bidService } from '../services/BidService';
import { watchlistService } from '../services/WatchlistService';

export class AuctionController {
  async getAuctions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { brand, model, status, minPrice, maxPrice, search, page, limit } = req.query;

      const parsedPage = page ? parseInt(page as string, 10) : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
      const parsedMinPrice = minPrice ? parseFloat(minPrice as string) : undefined;
      const parsedMaxPrice = maxPrice ? parseFloat(maxPrice as string) : undefined;

      const result = await auctionService.getAuctions({
        brand: brand as string,
        model: model as string,
        status: status as string,
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice,
        search: search as string,
        page: parsedPage,
        limit: parsedLimit
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAuctionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const auction = await auctionService.getAuctionById(id);
      res.status(200).json({ auction });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async getBidHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bids = await bidService.getBidsForAuction(id);
      res.status(200).json({ bids });
    } catch (error) {
      next(error);
    }
  }

  async placeBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id: auctionId } = req.params;
      const { amount } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { bid, auction } = await bidService.placeBid(userId, auctionId, amount);

      res.status(201).json({
        message: 'Bid placed successfully',
        bid,
        auction
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getWatchlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const watchlist = await watchlistService.getWatchlist(userId);
      res.status(200).json({ watchlist: watchlist.auctions });
    } catch (error) {
      next(error);
    }
  }

  async addToWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { auctionId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const watchlist = await watchlistService.addToWatchlist(userId, auctionId);
      res.status(200).json({
        message: 'Auction added to watchlist',
        watchlist: watchlist.auctions
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removeFromWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { auctionId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const watchlist = await watchlistService.removeFromWatchlist(userId, auctionId);
      res.status(200).json({
        message: 'Auction removed from watchlist',
        watchlist: watchlist.auctions
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

export const auctionController = new AuctionController();
