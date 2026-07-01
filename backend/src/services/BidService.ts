import { bidRepository } from '../repositories/BidRepository';
import { auctionRepository } from '../repositories/AuctionRepository';
import { IBid } from '../models/Bid';
import { IAuction } from '../models/Auction';
import { logger } from '../utils/logger';

export class BidService {
  async placeBid(userId: string, auctionId: string, amount: number): Promise<{ bid: IBid; auction: IAuction }> {
    const auction = await auctionRepository.findById(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Check auction live status
    if (auction.status !== 'live') {
      throw new Error(`Cannot place bid. Auction status is: ${auction.status}`);
    }

    const now = new Date();
    if (now > auction.endTime) {
      throw new Error('Auction has already ended');
    }

    // Sellers cannot bid on their own bikes
    if (auction.seller._id.toString() === userId) {
      throw new Error('You cannot bid on your own auction');
    }

    // Verify bid is higher than starting price or highest bid + min increment
    const minRequired = auction.highestBidAmount > 0
      ? auction.highestBidAmount + auction.minIncrement
      : auction.startingPrice;

    if (amount < minRequired) {
      throw new Error(`Bid must be at least ${minRequired}`);
    }

    // Create new bid record
    const bid = await bidRepository.create({
      auction: auction._id,
      bidder: userId,
      amount,
      status: 'success',
      timestamp: now
    } as any);

    // Update the highest bid reference on the auction atomically
    const updatedAuction = await auctionRepository.updateHighestBid(auctionId, bid._id.toString(), amount);
    if (!updatedAuction) {
      // Rollback: delete created bid document since update failed (another bid beat it)
      await bidRepository.delete(bid._id.toString());
      throw new Error('High bidding activity or higher bid placed. Please try again.');
    }

    // Asynchronously mark all other bids on this auction as 'outbid'
    bidRepository.markPreviousBidsAsOutbid(auctionId, bid._id.toString()).catch((err) => {
      logger.error(err as Error, `Failed to mark historical outbids for auction ${auctionId}`);
    });

    logger.info(`Successful bid: Bidder ${userId} placed ${amount} on Auction ${auctionId}`);

    // Fetch fresh populated auction
    const freshAuction = await auctionRepository.findById(auctionId);
    return { bid, auction: freshAuction || updatedAuction };
  }

  async getBidsForAuction(auctionId: string): Promise<IBid[]> {
    return bidRepository.findByAuctionId(auctionId);
  }

  async getBidsByUser(userId: string): Promise<IBid[]> {
    return bidRepository.findByBidderId(userId);
  }
}

export const bidService = new BidService();
