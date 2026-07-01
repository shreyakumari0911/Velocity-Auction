import { Auction, IAuction } from '../models/Auction';
import { Bike } from '../models/Bike';
import { FilterQuery, Types } from 'mongoose';

export interface AuctionFilterParams {
  brand?: string;
  model?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class AuctionRepository {
  async findById(id: string): Promise<IAuction | null> {
    return Auction.findById(id)
      .populate('bike')
      .populate({
        path: 'highestBid',
        populate: { path: 'bidder', select: 'name email' }
      })
      .populate('seller', 'name email')
      .exec();
  }

  async create(auctionData: Partial<IAuction>): Promise<IAuction> {
    const auction = new Auction(auctionData);
    const saved = await auction.save();
    return saved;
  }

  async update(id: string, auctionData: Partial<IAuction>): Promise<IAuction | null> {
    return Auction.findByIdAndUpdate(id, auctionData, { new: true })
      .populate('bike')
      .exec();
  }

  async delete(id: string): Promise<IAuction | null> {
    return Auction.findByIdAndDelete(id).exec();
  }

  async findWithFilters(params: AuctionFilterParams): Promise<{ auctions: IAuction[]; total: number }> {
    const { brand, model, status, minPrice, maxPrice, search, page = 1, limit = 10 } = params;
    const query: FilterQuery<IAuction> = {};

    // Filter by bike attributes (brand, model, text search)
    if (brand || model || search) {
      const bikeQuery: FilterQuery<any> = {};
      if (brand) bikeQuery.brand = new RegExp(brand, 'i');
      if (model) bikeQuery.model = new RegExp(model, 'i');
      if (search) {
        bikeQuery.$or = [
          { brand: new RegExp(search, 'i') },
          { model: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      const matchingBikes = await Bike.find(bikeQuery).select('_id').exec();
      const bikeIds = matchingBikes.map(b => b._id);
      query.bike = { $in: bikeIds };
    }

    if (status) {
      query.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.startingPrice = {};
      if (minPrice !== undefined) query.startingPrice.$gte = minPrice;
      if (maxPrice !== undefined) query.startingPrice.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [auctions, total] = await Promise.all([
      Auction.find(query)
        .populate('bike')
        .populate('seller', 'name email')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Auction.countDocuments(query).exec()
    ]);

    return { auctions, total };
  }

  async findScheduledToStart(time: Date): Promise<IAuction[]> {
    return Auction.find({
      status: 'scheduled',
      startTime: { $lte: time }
    }).exec();
  }

  async findLiveToExpire(time: Date): Promise<IAuction[]> {
    return Auction.find({
      status: 'live',
      endTime: { $lte: time }
    }).exec();
  }

  async updateHighestBid(
    auctionId: string,
    bidId: string,
    amount: number
  ): Promise<IAuction | null> {
    return Auction.findOneAndUpdate(
      {
        _id: auctionId,
        $or: [
          { highestBidAmount: { $lt: amount } },
          { highestBidAmount: 0 }
        ]
      },
      {
        highestBid: new Types.ObjectId(bidId),
        highestBidAmount: amount
      },
      { new: true }
    ).exec();
  }

  async findWonAuctions(userId: string): Promise<IAuction[]> {
    const auctions = await Auction.find({ status: 'sold' })
      .populate('bike')
      .populate({
        path: 'highestBid',
        populate: { path: 'bidder', select: '_id name email' }
      })
      .exec();

    return auctions.filter(
      (auc) =>
        auc.highestBid &&
        (auc.highestBid as any).bidder?._id.toString() === userId
    );
  }
}

export const auctionRepository = new AuctionRepository();
