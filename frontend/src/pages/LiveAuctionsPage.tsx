import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight, Zap, Calendar, Ban } from 'lucide-react';

interface AuctionItem {
  _id: string;
  startingPrice: number;
  highestBidAmount: number;
  startTime: string;
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

export const LiveAuctionsPage: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('live');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const paramsObj: any = {
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
        brand: brand || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined
      };
      
      const queryParams = Object.keys(paramsObj)
        .filter(key => paramsObj[key] !== undefined)
        .map(key => `${key}=${encodeURIComponent(paramsObj[key])}`)
        .join('&');

      const { data } = await api.get(`/auctions?${queryParams}`);
      setAuctions(data.auctions);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAuctions();
  };

  const handleReset = () => {
    setSearch('');
    setBrand('');
    setStatus('live');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="border-b-4 border-black dark:border-white pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight">Motorcycle Catalog</h1>
        <p className="text-muted-foreground font-semibold text-sm mt-1">Search, filter, and track live and scheduled motorcycle auctions</p>
      </div>

      {/* Filter and Search Panel Box */}
      <form onSubmit={handleSearchSubmit} className="p-6 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4 text-black dark:text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-white stroke-[2.5px]" />
            <input
              type="text"
              placeholder="Search make, model, year..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-input w-full pl-10 text-sm font-semibold"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border-3 border-black dark:border-white bg-white dark:bg-black font-extrabold text-sm outline-none transition-all focus:box-shadow cursor-pointer"
            >
              <option value="live">Live Now</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="sold">Sold</option>
              <option value="">All Statuses</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="neo-btn flex-grow bg-[#FFDE4D] text-black text-xs font-black"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="neo-btn px-4 bg-[#FF5F00] text-white text-xs font-black"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-3 border-dashed border-black dark:border-white mt-2">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider block">Manufacturer / Brand</label>
            <input
              type="text"
              placeholder="e.g. Ducati, Yamaha"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="neo-input w-full p-2 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider block">Min Price ($)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="neo-input w-full p-2 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider block">Max Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="neo-input w-full p-2 text-xs"
            />
          </div>
        </div>
      </form>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-96 border-3 border-black bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4 stroke-[2px]" />
          <h3 className="font-black text-xl uppercase">No Results Found</h3>
          <p className="text-muted-foreground font-semibold text-xs mt-1">Try modifying your filter categories or keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {auctions.map(auc => {
            const isLive = auc.status === 'live';
            const isSched = auc.status === 'scheduled';
            const isSold = auc.status === 'sold';
            const price = auc.highestBidAmount > 0 ? auc.highestBidAmount : auc.startingPrice;

            return (
              <div key={auc._id} className="group border-3 border-black dark:border-white bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all flex flex-col h-full text-black dark:text-white">
                
                {/* Image Frame */}
                <div className="aspect-video w-full bg-muted relative border-b-3 border-black dark:border-white overflow-hidden">
                  <img
                    src={getImageUrl(auc.bike.images[0])}
                    alt={`${auc.bike.brand} ${auc.bike.model}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Saturated Brutalist Badges */}
                  {isLive && (
                    <span className="absolute top-3 left-3 bg-[#FF007A] text-white border-2 border-black px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Live
                    </span>
                  )}
                  {isSched && (
                    <span className="absolute top-3 left-3 bg-[#00F0FF] text-black border-2 border-black px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Scheduled
                    </span>
                  )}
                  {(!isLive && !isSched) && (
                    <span className="absolute top-3 left-3 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                      <Ban className="h-3 w-3" /> {isSold ? 'Sold' : 'Ended'}
                    </span>
                  )}
                </div>

                {/* Info details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 border-2 border-black dark:border-white bg-[#00F0FF] text-black inline-block">
                      {auc.bike.year}
                    </span>
                    <h3 className="font-black text-lg uppercase tracking-tight line-clamp-1">{auc.bike.brand} {auc.bike.model}</h3>
                    <p className="text-xs font-semibold text-muted-foreground line-clamp-2">{auc.bike.description}</p>
                  </div>

                  <div className="pt-4 border-t-3 border-dashed border-black dark:border-white mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase font-black block">{isLive ? 'Current Bid' : isSched ? 'Starting Price' : 'Final Price'}</span>
                      <span className="text-xl font-black text-[#FF007A] dark:text-[#00F0FF]">${price}</span>
                    </div>
                    <Link
                      to={`/auctions/${auc._id}`}
                      className="px-4 py-2 bg-[#FFDE4D] text-black font-black uppercase border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-xs"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Brutalist Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 text-black dark:text-white">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 border-3 border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5px]" />
          </button>
          <span className="text-sm font-black uppercase font-mono bg-white dark:bg-black px-4 py-2 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 border-3 border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer"
          >
            <ArrowRight className="h-4 w-4 stroke-[2.5px]" />
          </button>
        </div>
      )}
    </div>
  );
};
