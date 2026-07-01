import { Bid, IBid } from '../models/Bid';
import { Types } from 'mongoose';

export class BidRepository {
  async create(bidData: Partial<IBid>): Promise<IBid> {
    const bid = new Bid(bidData);
    return bid.save();
  }

  async findById(id: string): Promise<IBid | null> {
    return Bid.findById(id).populate('bidder', 'name email').exec();
  }

  async findByAuctionId(auctionId: string): Promise<IBid[]> {
    return Bid.find({ auction: new Types.ObjectId(auctionId) })
      .populate('bidder', 'name email')
      .sort({ amount: -1 })
      .exec();
  }

  async findByBidderId(bidderId: string): Promise<IBid[]> {
    return Bid.find({ bidder: new Types.ObjectId(bidderId) })
      .populate({
        path: 'auction',
        populate: { path: 'bike' }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findHighestForAuction(auctionId: string): Promise<IBid | null> {
    return Bid.findOne({ auction: new Types.ObjectId(auctionId) })
      .sort({ amount: -1 })
      .exec();
  }

  async updateStatus(id: string, status: 'success' | 'outbid' | 'rejected'): Promise<IBid | null> {
    return Bid.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async markPreviousBidsAsOutbid(auctionId: string, currentBidId: string): Promise<void> {
    await Bid.updateMany(
      {
        auction: new Types.ObjectId(auctionId),
        _id: { $ne: new Types.ObjectId(currentBidId) },
        status: 'success'
      },
      { status: 'outbid' }
    ).exec();
  }

  async delete(id: string): Promise<IBid | null> {
    return Bid.findByIdAndDelete(id).exec();
  }
}

export const bidRepository = new BidRepository();
