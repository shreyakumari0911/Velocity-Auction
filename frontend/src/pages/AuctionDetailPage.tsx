import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { Clock, ShieldAlert, CheckCircle, Zap, Eye } from 'lucide-react';

interface Bid {
  _id: string;
  bidder: {
    name: string;
    email: string;
  };
  amount: number;
  timestamp: string;
  status: string;
}

interface AuctionDetail {
  _id: string;
  startingPrice: number;
  reservePrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
  status: string;
  highestBidAmount: number;
  highestBid: {
    _id: string;
    bidder: {
      name: string;
    };
  } | null;
  seller: {
    _id: string;
    name: string;
  };
  bike: {
    brand: string;
    model: string;
    year: number;
    fuel: string;
    kmDriven: number;
    ownership: string;
    images: string[];
    description: string;
  };
}

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hook up real-time Socket.io updates for this auction room
  const { isConnected, latestBid, statusChange, errorMsg, placeBid } = useSocket(id);

  // 1. Fetch initial details on load
  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        const [detailRes, bidsRes] = await Promise.all([
          api.get(`/auctions/${id}`),
          api.get(`/auctions/${id}/bids`)
        ]);
        setAuction(detailRes.data.auction);
        setBids(bidsRes.data.bids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  // 2. React to real-time incoming Socket.io bid updates
  useEffect(() => {
    if (latestBid && auction) {
      setAuction((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          highestBidAmount: latestBid.amount,
          highestBid: {
            _id: latestBid.bidId,
            bidder: { name: latestBid.bidderName }
          }
        };
      });

      setBids((prev) => {
        const alreadyExists = prev.some(b => b._id === latestBid.bidId);
        if (alreadyExists) return prev;
        
        const newBid: Bid = {
          _id: latestBid.bidId,
          bidder: { name: latestBid.bidderName, email: '' },
          amount: latestBid.amount,
          timestamp: latestBid.timestamp,
          status: 'success'
        };
        return [newBid, ...prev.map(b => ({ ...b, status: 'outbid' }))];
      });

      if (user && latestBid.bidderName === user.name) {
        setSuccessMsg('Your bid was successfully broadcast!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  }, [latestBid, user]);

  // 3. React to real-time status transitions
  useEffect(() => {
    if (statusChange && auction) {
      setAuction((prev: any) => {
        if (!prev) return null;
        return { ...prev, status: statusChange };
      });
    }
  }, [statusChange]);

  // 4. Time remaining countdown state
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!auction || auction.status !== 'live') return;

    const timer = setInterval(() => {
      const difference = new Date(auction.endTime).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft('Ended');
        clearInterval(timer);
        setAuction((prev: any) => prev ? { ...prev, status: 'ended' } : null);
      } else {
        const hrs = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((difference / 1000 / 60) % 60);
        const secs = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  if (loading) {
    return <div className="h-96 border-3 border-black bg-muted animate-pulse"></div>;
  }

  if (!auction) {
    return (
      <div className="text-center py-20 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black uppercase">Auction Listing Not Found</h3>
        <Link to="/auctions" className="neo-btn bg-[#FFDE4D] mt-4 inline-block text-black">Return to Catalog</Link>
      </div>
    );
  }

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(bidAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    placeBid(amountNum);
    setBidAmount('');
  };

  const isLive = auction.status === 'live';
  const isOwner = user && auction.seller._id === user._id;
  const currentPrice = auction.highestBidAmount > 0 ? auction.highestBidAmount : auction.startingPrice;
  const minRequiredBid = auction.highestBidAmount > 0 
    ? auction.highestBidAmount + auction.minIncrement 
    : auction.startingPrice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 text-black dark:text-white">
      
      {/* Visual left columns */}
      <div className="lg:col-span-2 space-y-6">
        {/* Frame Box */}
        <div className="border-4 border-black dark:border-white bg-[#00F0FF] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] aspect-video relative overflow-hidden">
          <img
            src={getImageUrl(auction.bike.images[0])}
            alt={`${auction.bike.brand} ${auction.bike.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Detailed Info Frame */}
        <div className="p-6 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">{auction.bike.brand} {auction.bike.model}</h1>
          <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{auction.bike.description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t-3 border-dashed border-black dark:border-white">
            <div className="p-3 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[10px] text-muted-foreground uppercase font-black block">Year</span>
              <span className="font-extrabold text-sm uppercase">{auction.bike.year}</span>
            </div>
            <div className="p-3 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[10px] text-muted-foreground uppercase font-black block">Fuel Type</span>
              <span className="font-extrabold text-sm uppercase">{auction.bike.fuel}</span>
            </div>
            <div className="p-3 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[10px] text-muted-foreground uppercase font-black block">KM Driven</span>
              <span className="font-extrabold text-sm uppercase">{auction.bike.kmDriven.toLocaleString()}</span>
            </div>
            <div className="p-3 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[10px] text-muted-foreground uppercase font-black block">Ownership</span>
              <span className="font-extrabold text-sm uppercase">{auction.bike.ownership}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Control Panels */}
      <div className="space-y-6">
        {/* Sync panel */}
        <div className="flex items-center justify-between text-xs font-black uppercase px-4 py-2 border-3 border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-muted-foreground">WS CONNECTION</span>
          <span className={`font-black flex items-center gap-1 ${isConnected ? 'text-[#00FF66]' : 'text-[#FF5F00]'}`}>
            <span className={`w-2.5 h-2.5 border-2 border-black rounded-none ${isConnected ? 'bg-[#00FF66] animate-ping' : 'bg-[#FF5F00]'}`}></span>
            {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
          </span>
        </div>

        {/* Pricing panel */}
        <div className="p-6 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-black block uppercase">Current bid</span>
              <span className="text-3xl font-black text-[#FF007A] dark:text-[#00F0FF]">${currentPrice}</span>
            </div>
            {isLive && (
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground font-black block uppercase">Closing In</span>
                <span className="text-xl font-mono font-black text-[#FF5F00] flex items-center gap-1 uppercase bg-[#FF5F00]/10 px-2 py-0.5 border-2 border-[#FF5F00]">
                  <Clock className="h-4 w-4 stroke-[2.5px]" /> {timeLeft || '00:00:00'}
                </span>
              </div>
            )}
          </div>

          {/* Banners */}
          {errorMsg && (
            <div className="p-3 bg-[#FF5F00] text-white text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 stroke-[3px]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#00FF66] text-black text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 stroke-[3px]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Place bid form */}
          {user ? (
            isOwner ? (
              <div className="p-3 border-2 border-dashed border-black dark:border-white text-xs font-bold text-muted-foreground text-center uppercase bg-muted/20">
                You are the seller of this bike listing
              </div>
            ) : isLive ? (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block font-black uppercase tracking-wider">Minimum required bid: ${minRequiredBid}</span>
                  <input
                    type="number"
                    required
                    min={minRequiredBid}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Enter $${minRequiredBid} or more`}
                    className="neo-input w-full text-base font-black"
                  />
                </div>
                <button
                  type="submit"
                  className="neo-btn w-full py-3.5 bg-[#FFDE4D] text-black text-sm font-black flex items-center justify-center gap-2"
                >
                  <Zap className="h-5 w-5 stroke-[2.5px] fill-current" /> Place Live Bid
                </button>
              </form>
            ) : (
              <div className="p-4 border-3 border-black dark:border-white bg-[#F9F6F0] dark:bg-black font-black uppercase text-center text-xs text-muted-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Auction is currently {auction.status}
              </div>
            )
          ) : (
            <div className="text-center py-4 border-3 border-black bg-[#F9F6F0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold text-muted-foreground uppercase">Sign in to participate in the bid</p>
              <Link to="/login" className="neo-btn mt-3 inline-block bg-[#00F0FF] text-black text-xs font-black">Login Now</Link>
            </div>
          )}
        </div>

        {/* History panel */}
        <div className="p-6 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
          <h3 className="font-black text-sm tracking-wide text-muted-foreground uppercase border-b-3 border-dashed border-black dark:border-white pb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 stroke-[2.5px]" /> Live Bid History
          </h3>

          {bids.length === 0 ? (
            <p className="text-xs font-bold text-muted-foreground text-center py-4 uppercase">No bids placed yet.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {bids.map((bid, index) => (
                <div key={bid._id} className="flex justify-between items-center text-xs py-2.5 border-b border-black/10 dark:border-white/10 last:border-0">
                  <div className="space-y-1">
                    <span className="font-black block uppercase">{bid.bidder.name}</span>
                    <span className="text-muted-foreground font-semibold text-[9px]">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-black text-sm block">${bid.amount}</span>
                    <span className={`px-2 py-0.5 border-2 border-black text-[9px] font-black uppercase ${index === 0 ? 'bg-[#00FF66] text-black' : 'bg-muted text-muted-foreground'}`}>
                      {index === 0 ? 'Highest' : 'Outbid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
