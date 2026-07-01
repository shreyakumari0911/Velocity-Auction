import { bidService } from '../services/BidService';
import { bidRepository } from '../repositories/BidRepository';
import { auctionRepository } from '../repositories/AuctionRepository';

jest.mock('../repositories/BidRepository');
jest.mock('../repositories/AuctionRepository');

describe('BidService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuction: any = {
    _id: 'auction_id_123',
    startingPrice: 1000,
    reservePrice: 2000,
    minIncrement: 100,
    startTime: new Date(Date.now() - 3600000), // Started 1hr ago
    endTime: new Date(Date.now() + 3600000),   // Ends in 1hr
    status: 'live',
    highestBidAmount: 1500,
    highestBid: 'bid_id_abc',
    seller: {
      _id: 'seller_user_id'
    }
  };

  describe('placeBid', () => {
    it('should place a bid successfully if all rules are satisfied', async () => {
      (auctionRepository.findById as jest.Mock).mockResolvedValue(mockAuction);
      const newBidMock: any = {
        _id: 'new_bid_id',
        auction: 'auction_id_123',
        bidder: 'bidder_user_id',
        amount: 1700,
        status: 'success'
      };
      (bidRepository.create as jest.Mock).mockResolvedValue(newBidMock);
      (auctionRepository.updateHighestBid as jest.Mock).mockResolvedValue({
        ...mockAuction,
        highestBidAmount: 1700,
        highestBid: 'new_bid_id'
      });
      (bidRepository.markPreviousBidsAsOutbid as jest.Mock).mockResolvedValue(undefined);

      const result = await bidService.placeBid('bidder_user_id', 'auction_id_123', 1700);

      expect(auctionRepository.findById).toHaveBeenCalledWith('auction_id_123');
      expect(bidRepository.create).toHaveBeenCalled();
      expect(auctionRepository.updateHighestBid).toHaveBeenCalledWith('auction_id_123', 'new_bid_id', 1700);
      expect(result.bid.amount).toBe(1700);
    });

    it('should fail if the seller tries to bid on their own auction', async () => {
      (auctionRepository.findById as jest.Mock).mockResolvedValue(mockAuction);

      await expect(
        bidService.placeBid('seller_user_id', 'auction_id_123', 1800)
      ).rejects.toThrow('You cannot bid on your own auction');

      expect(bidRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if the bid amount does not meet the minimum increment', async () => {
      (auctionRepository.findById as jest.Mock).mockResolvedValue(mockAuction);

      // Highest bid is 1500, min increment is 100 -> min required is 1600.
      await expect(
        bidService.placeBid('bidder_user_id', 'auction_id_123', 1550)
      ).rejects.toThrow('Bid must be at least 1600');

      expect(bidRepository.create).not.toHaveBeenCalled();
    });

    it('should fail if the auction is not live', async () => {
      const mockEndedAuction = { ...mockAuction, status: 'ended' };
      (auctionRepository.findById as jest.Mock).mockResolvedValue(mockEndedAuction);

      await expect(
        bidService.placeBid('bidder_user_id', 'auction_id_123', 1800)
      ).rejects.toThrow('Cannot place bid. Auction status is: ended');
    });
  });
});
