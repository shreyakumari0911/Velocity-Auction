import { Watchlist, IWatchlist } from '../models/Watchlist';
import { Types } from 'mongoose';

export class WatchlistRepository {
  async findByUserId(userId: string): Promise<IWatchlist | null> {
    return Watchlist.findOne({ user: new Types.ObjectId(userId) })
      .populate({
        path: 'auctions',
        populate: { path: 'bike' }
      })
      .exec();
  }

  async create(userId: string): Promise<IWatchlist> {
    const wl = new Watchlist({ user: new Types.ObjectId(userId), auctions: [] });
    return wl.save();
  }

  async addToWatchlist(userId: string, auctionId: string): Promise<IWatchlist | null> {
    const auctionOid = new Types.ObjectId(auctionId);
    return Watchlist.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $addToSet: { auctions: auctionOid } },
      { new: true, upsert: true }
    ).exec();
  }

  async removeFromWatchlist(userId: string, auctionId: string): Promise<IWatchlist | null> {
    const auctionOid = new Types.ObjectId(auctionId);
    return Watchlist.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $pull: { auctions: auctionOid } },
      { new: true }
    ).exec();
  }

  async isInWatchlist(userId: string, auctionId: string): Promise<boolean> {
    const wl = await Watchlist.findOne({
      user: new Types.ObjectId(userId),
      auctions: new Types.ObjectId(auctionId)
    }).exec();
    return wl !== null;
  }
}

export const watchlistRepository = new WatchlistRepository();
