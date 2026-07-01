import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Heart, Compass, CheckCircle2, XCircle } from 'lucide-react';

interface BidItem {
  _id: string;
  amount: number;
  timestamp: string;
  status: 'success' | 'outbid' | 'rejected';
  auction: {
    _id: string;
    status: string;
    highestBidAmount: number;
    bike: {
      brand: string;
      model: string;
      year: number;
    };
  };
}

export const MyBidsPage: React.FC = () => {
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data } = await api.get('/auth/bids');
        setBids(data.bids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  return (
    <div className="space-y-8 py-4 text-black dark:text-white">
      {/* Header Banner */}
      <div className="border-b-4 border-black dark:border-white pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-2.5">
          <Heart className="h-9 w-9 text-[#FF007A] fill-current" /> MY BIDS
        </h1>
        <p className="text-muted-foreground font-semibold text-sm mt-1">Track superbike listings you participate in</p>
      </div>

      {loading ? (
        <div className="h-96 border-3 border-black bg-muted animate-pulse"></div>
      ) : bids.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Compass className="h-12 w-12 text-muted-foreground mx-auto mb-4 stroke-[2px]" />
          <h3 className="font-black text-xl uppercase">No Bids Placed</h3>
          <p className="text-muted-foreground font-semibold text-xs mt-1 mb-6">Explore the active listings catalog to place your first bid.</p>
          <Link to="/auctions" className="neo-btn bg-[#FFDE4D] text-black text-xs font-black px-6 py-3 inline-block">
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-3 border-black dark:border-white bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Motorcycle</th>
                  <th className="p-4">My Bid</th>
                  <th className="p-4">Auction Status</th>
                  <th className="p-4">Bid status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 dark:divide-white/10 text-sm font-bold text-black dark:text-white">
                {bids.map((bid) => {
                  const isWinning = bid.amount === bid.auction.highestBidAmount && bid.auction.status === 'live';
                  const isOutbid = bid.status === 'outbid';
                  
                  return (
                    <tr key={bid._id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div>
                          <span className="font-black block text-base uppercase">
                            {bid.auction.bike.brand} {bid.auction.bike.model}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">{bid.auction.bike.year}</span>
                        </div>
                      </td>
                      <td className="p-4 text-base font-black text-[#FF007A] dark:text-[#00F0FF]">${bid.amount}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          bid.auction.status === 'live' 
                            ? 'bg-[#00FF66] text-black' 
                            : bid.auction.status === 'sold'
                            ? 'bg-[#FFDE4D] text-black'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {bid.auction.status}
                        </span>
                      </td>
                      <td className="p-4 font-black">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${
                          isWinning 
                            ? 'text-[#00FF66]' 
                            : isOutbid 
                            ? 'text-[#FF5F00]' 
                            : 'text-muted-foreground'
                        }`}>
                          {isWinning ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 stroke-[3px]" /> WINNING
                            </>
                          ) : isOutbid ? (
                            <>
                              <XCircle className="h-4 w-4 stroke-[3px]" /> OUTBID
                            </>
                          ) : (
                            'COMPLETED'
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/auctions/${bid.auction._id}`}
                          className="px-3.5 py-2 bg-white dark:bg-black text-black dark:text-white font-extrabold text-xs uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all inline-block"
                        >
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
