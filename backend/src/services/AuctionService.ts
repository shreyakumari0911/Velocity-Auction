import { auctionRepository, AuctionFilterParams } from '../repositories/AuctionRepository';
import { bikeRepository } from '../repositories/BikeRepository';
import { IAuction } from '../models/Auction';
import { IBike } from '../models/Bike';
import { logger } from '../utils/logger';

export class AuctionService {
  async createAuction(
    sellerId: string,
    bikeData: Partial<IBike>,
    auctionData: Omit<Partial<IAuction>, 'bike' | 'seller'>
  ): Promise<IAuction> {
    // 1. Create the bike first
    const bike = await bikeRepository.create(bikeData);

    // 2. Determine initial status based on times
    const now = new Date();
    const startTime = auctionData.startTime ? new Date(auctionData.startTime) : now;
    const status = startTime <= now ? 'live' : 'scheduled';

    // 3. Create the auction
    const auction = await auctionRepository.create({
      ...auctionData,
      bike: bike._id,
      seller: sellerId,
      status,
      startTime,
      highestBidAmount: auctionData.startingPrice || 0
    } as any);

    logger.info(`Auction created successfully: ${auction._id} with Bike ${bike._id}`);
    return auction;
  }

  async getAuctions(params: AuctionFilterParams): Promise<{ auctions: IAuction[]; total: number }> {
    return auctionRepository.findWithFilters(params);
  }

  async getAuctionById(id: string): Promise<IAuction> {
    const auction = await auctionRepository.findById(id);
    if (!auction) {
      throw new Error('Auction not found');
    }
    return auction;
  }

  async updateAuction(
    id: string,
    userId: string,
    userRole: 'user' | 'admin',
    bikeUpdates: Partial<IBike>,
    auctionUpdates: Partial<IAuction>
  ): Promise<IAuction> {
    const auction = await auctionRepository.findById(id);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Permission check
    if (userRole !== 'admin' && auction.seller.toString() !== userId) {
      throw new Error('Unauthorized to update this auction');
    }

    // State check: Only allow updates in 'draft' or 'scheduled'
    if (auction.status !== 'draft' && auction.status !== 'scheduled') {
      throw new Error('Cannot modify an auction that has already started or ended');
    }

    // Update associated bike
    if (Object.keys(bikeUpdates).length > 0) {
      await bikeRepository.update(auction.bike._id.toString(), bikeUpdates);
    }

    // Update auction fields
    const updated = await auctionRepository.update(id, auctionUpdates);
    if (!updated) {
      throw new Error('Failed to update auction');
    }

    logger.info(`Auction updated: ${id}`);
    return updated;
  }

  async deleteAuction(id: string, userId: string, userRole: 'user' | 'admin'): Promise<void> {
    const auction = await auctionRepository.findById(id);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Permission check
    if (userRole !== 'admin' && auction.seller.toString() !== userId) {
      throw new Error('Unauthorized to delete this auction');
    }

    // State check
    if (auction.status !== 'draft' && auction.status !== 'scheduled') {
      throw new Error('Cannot delete an auction that has already started or ended');
    }

    // Delete bike and auction
    await bikeRepository.delete(auction.bike._id.toString());
    await auctionRepository.delete(id);

    logger.info(`Auction and bike deleted: ${id}`);
  }
}

export const auctionService = new AuctionService();
