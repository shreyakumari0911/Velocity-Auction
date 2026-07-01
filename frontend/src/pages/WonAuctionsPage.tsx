import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { Award, ShieldCheck, Mail } from 'lucide-react';

interface WonAuctionItem {
  _id: string;
  highestBidAmount: number;
  endTime: string;
  bike: {
    brand: string;
    model: string;
    year: number;
    images: string[];
  };
}

export const WonAuctionsPage: React.FC = () => {
  const [won, setWon] = useState<WonAuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWon = async () => {
      try {
        const { data } = await api.get('/auth/won');
        setWon(data.wonAuctions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWon();
  }, []);

  return (
    <div className="space-y-8 py-4 text-black dark:text-white">
      {/* Header Banner */}
      <div className="border-b-4 border-black dark:border-white pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-2.5">
          <Award className="h-9 w-9 text-[#FFDE4D] fill-current stroke-[1.5px]" /> WON AUCTIONS
        </h1>
        <p className="text-muted-foreground font-semibold text-sm mt-1">Review motorcycles you won in active live auctions</p>
      </div>

      {loading ? (
        <div className="h-96 border-3 border-black bg-muted animate-pulse"></div>
      ) : won.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 stroke-[2px]" />
          <h3 className="font-black text-xl uppercase">No Won Listings</h3>
          <p className="text-muted-foreground font-semibold text-xs mt-1 mb-6">Winners are declared instantly upon timer expiration. Start bidding!</p>
          <Link to="/auctions" className="neo-btn bg-[#FFDE4D] text-black text-xs font-black px-6 py-3 inline-block">
            Browse Live auctions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {won.map((item) => (
            <div key={item._id} className="border-3 border-black dark:border-white bg-white dark:bg-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden flex flex-col sm:flex-row h-full">
              
              {/* Image Frame */}
              <div className="aspect-video sm:aspect-auto sm:w-48 bg-muted shrink-0 relative border-b-3 sm:border-b-0 sm:border-r-3 border-black dark:border-white">
                <img
                  src={getImageUrl(item.bike.images[0])}
                  alt={`${item.bike.brand} ${item.bike.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1 flex flex-col justify-between text-black dark:text-white">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black tracking-wider text-black bg-[#00FF66] border-2 border-black px-2.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck className="h-3.5 w-3.5 stroke-[3px]" /> Winner Verified
                  </span>
                  <h3 className="font-black text-xl uppercase tracking-tight">{item.bike.brand} {item.bike.model}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Closed: {new Date(item.endTime).toLocaleDateString()}</p>
                </div>

                <div className="pt-4 border-t-3 border-dashed border-black dark:border-white mt-5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-black block">Final Bid Price</span>
                    <span className="text-xl font-black text-[#FF007A] dark:text-[#00F0FF]">${item.highestBidAmount}</span>
                  </div>
                  <a
                    href="mailto:settlement@velocityauction.com"
                    className="px-4 py-2 bg-[#00F0FF] text-black font-black uppercase border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-xs flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5 stroke-[2.5px]" /> Checkout
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
