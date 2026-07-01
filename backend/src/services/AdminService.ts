import { Auction } from '../models/Auction';
import { Bid } from '../models/Bid';
import { User } from '../models/User';

export class AdminService {
  async getDashboardMetrics(): Promise<{
    usersCount: number;
    bidsCount: number;
    auctions: {
      draft: number;
      scheduled: number;
      live: number;
      ended: number;
      sold: number;
    };
    totalVolume: number;
  }> {
    const [
      totalUsers,
      totalBids,
      activeAuctions,
      endedAuctions,
      draftAuctions,
      scheduledAuctions,
      soldAuctions
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }).exec(),
      Bid.countDocuments().exec(),
      Auction.countDocuments({ status: 'live' }).exec(),
      Auction.countDocuments({ status: 'ended' }).exec(),
      Auction.countDocuments({ status: 'draft' }).exec(),
      Auction.countDocuments({ status: 'scheduled' }).exec(),
      Auction.countDocuments({ status: 'sold' }).exec()
    ]);

    // Aggregate total traded volume of sold auctions
    const salesAggregate = await Auction.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: null, totalSales: { $sum: '$highestBidAmount' } } }
    ]);
    
    const totalVolume = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    return {
      usersCount: totalUsers,
      bidsCount: totalBids,
      auctions: {
        draft: draftAuctions,
        scheduled: scheduledAuctions,
        live: activeAuctions,
        ended: endedAuctions,
        sold: soldAuctions
      },
      totalVolume
    };
  }
}

export const adminService = new AdminService();
