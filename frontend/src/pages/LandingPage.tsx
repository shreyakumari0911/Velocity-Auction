import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { TrendingUp, ShieldCheck, Zap, ArrowRight, Clock } from 'lucide-react';

interface AuctionItem {
  _id: string;
  startingPrice: number;
  highestBidAmount: number;
  endTime: string;
  status: string;
  bike: {
    brand: string;
    model: string;
    year: number;
    images: string[];
    description: string;
  };
}

export const LandingPage: React.FC = () => {
  const [featured, setFeatured] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/auctions?status=live&limit=3');
        setFeatured(data.auctions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Section Banner */}
      <section className="p-8 md:p-16 border-4 border-black dark:border-white bg-[#00F0FF] dark:bg-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10 text-black dark:text-white">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 border-3 border-black dark:border-white bg-[#FFDE4D] text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-4 w-4 animate-bounce" /> Real-time active auctions
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
            BID ON <br/>
            <span className="bg-white dark:bg-black px-4 py-1 border-3 border-black dark:border-white inline-block mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              SUPERBIKES
            </span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-black/80 dark:text-white/80 max-w-xl">
            Live motorcycle auction catalog. Enforced by database atomic concurrency updates and instant WebSocket bid broadcasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/auctions"
              className="px-8 py-4 bg-[#FFDE4D] text-black font-black uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 text-sm"
            >
              Browse Catalog <ArrowRight className="h-5 w-5 stroke-[2.5px]" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-black font-black uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Blocks Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border-3 border-black dark:border-white bg-[#FFDE4D] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-start gap-4">
          <span className="p-3 bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <TrendingUp className="h-6 w-6 stroke-[2.5px]" />
          </span>
          <div>
            <h3 className="font-black uppercase text-base">Real-Time Bids</h3>
            <p className="text-xs font-semibold mt-2 leading-relaxed">Socket.io connection channels sync every bid across client detail panels immediately.</p>
          </div>
        </div>

        <div className="p-6 border-3 border-black dark:border-white bg-[#00F0FF] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-start gap-4">
          <span className="p-3 bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="h-6 w-6 stroke-[2.5px]" />
          </span>
          <div>
            <h3 className="font-black uppercase text-base">Atomic Lock</h3>
            <p className="text-xs font-semibold mt-2 leading-relaxed">Optimistic locking writes concurrently-safe bid updates directly on MongoDB Atlas.</p>
          </div>
        </div>

        <div className="p-6 border-3 border-black dark:border-white bg-[#FF007A] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-start gap-4">
          <span className="p-3 bg-white text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="h-6 w-6 stroke-[2.5px]" />
          </span>
          <div>
            <h3 className="font-black uppercase text-base">15s Worker Job</h3>
            <p className="text-xs font-semibold mt-2 leading-relaxed">Cron status processors resolve active items, auto-assigning winner checkout roles.</p>
          </div>
        </div>
      </section>

      {/* Featured Items Grid */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-4 border-black dark:border-white pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Active Live Bids</h2>
            <p className="text-muted-foreground text-sm font-semibold mt-1">High-end superbikes available right now</p>
          </div>
          <Link to="/auctions" className="px-4 py-2 border-3 border-black dark:border-white bg-white dark:bg-black font-extrabold text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
            Browse All Listings
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 border-3 border-black bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-black dark:border-white bg-card">
            <p className="font-bold text-muted-foreground">No auctions currently live. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((auc) => (
              <div key={auc._id} className="group border-3 border-black dark:border-white bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all flex flex-col h-full">
                
                {/* Image Frame */}
                <div className="aspect-video w-full bg-muted relative border-b-3 border-black dark:border-white overflow-hidden">
                  <img
                    src={getImageUrl(auc.bike.images[0])}
                    alt={`${auc.bike.brand} ${auc.bike.model}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#FF007A] text-white border-2 border-black text-xs font-black uppercase tracking-wider px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 animate-pulse">
                    Live
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between text-black dark:text-white">
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 border-2 border-black dark:border-white bg-[#00F0FF] text-black inline-block">
                      {auc.bike.year}
                    </span>
                    <h3 className="font-black text-xl uppercase tracking-tight line-clamp-1">
                      {auc.bike.brand} {auc.bike.model}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground line-clamp-2">{auc.bike.description}</p>
                  </div>

                  <div className="pt-4 border-t-3 border-dashed border-black dark:border-white mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Bid</span>
                      <span className="text-2xl font-black text-[#FF007A] dark:text-[#00F0FF]">${auc.highestBidAmount || auc.startingPrice}</span>
                    </div>
                    <Link
                      to={`/auctions/${auc._id}`}
                      className="px-4 py-2 bg-[#FFDE4D] text-black font-black uppercase border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-xs"
                    >
                      Bid Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
