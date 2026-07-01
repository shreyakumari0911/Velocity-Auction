import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { BarChart3, Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Metrics {
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
}

interface AuctionListItem {
  _id: string;
  startingPrice: number;
  highestBidAmount: number;
  status: string;
  bike: {
    brand: string;
    model: string;
    year: number;
  };
}

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuel, setFuel] = useState('Petrol');
  const [kmDriven, setKmDriven] = useState('');
  const [ownership, setOwnership] = useState('First Owner');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('100');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // UI States
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const [metricsRes, listRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/auctions?limit=50')
      ]);
      setMetrics(metricsRes.data);
      setAuctions(listRes.data.auctions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Handle image files selection & upload immediately
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setFormError(null);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages(prev => [...prev, ...data.urls]);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (images.length === 0) {
      setFormError('Please upload at least one image of the motorcycle');
      return;
    }

    try {
      const payload = {
        brand,
        model,
        year: parseInt(year),
        fuel,
        kmDriven: parseInt(kmDriven),
        ownership,
        images,
        description,
        startingPrice: parseFloat(startingPrice),
        reservePrice: parseFloat(reservePrice),
        minIncrement: parseFloat(minIncrement),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      };

      await api.post('/admin/auctions', payload);
      setFormSuccess('Auction registered successfully!');
      
      // Reset form
      setBrand('');
      setModel('');
      setYear('');
      setKmDriven('');
      setDescription('');
      setStartingPrice('');
      setReservePrice('');
      setImages([]);
      
      loadDashboard();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create auction. Double check input dates.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    try {
      await api.delete(`/admin/auctions/${id}`);
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete auction');
    }
  };

  if (loading) {
    return <div className="h-96 border-3 border-black bg-muted animate-pulse"></div>;
  }

  return (
    <div className="space-y-12 py-4 text-black dark:text-white">
      {/* Header Banner */}
      <div className="border-b-4 border-black dark:border-white pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight">Admin Portal</h1>
        <p className="text-muted-foreground font-semibold text-sm mt-1">Manage live auction listings and review marketplace aggregates</p>
      </div>

      {/* Analytics Grid */}
      {metrics && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 border-3 border-black bg-[#FFDE4D] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-black/70 font-black block uppercase">Total Users</span>
            <span className="text-4xl font-black mt-1 block">{metrics.usersCount}</span>
          </div>
          <div className="p-6 border-3 border-black bg-[#00F0FF] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-black/70 font-black block uppercase">Total Bids</span>
            <span className="text-4xl font-black mt-1 block">{metrics.bidsCount}</span>
          </div>
          <div className="p-6 border-3 border-black bg-[#FF007A] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-white/70 font-black block uppercase">Live Auctions</span>
            <span className="text-4xl font-black mt-1 block">{metrics.auctions.live}</span>
          </div>
          <div className="p-6 border-3 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-white/70 font-black block uppercase">Trade Volume</span>
            <span className="text-4xl font-black mt-1 block">${metrics.totalVolume}</span>
          </div>
        </section>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Create Auction Form */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Plus className="h-6 w-6 stroke-[3px]" /> Register Superbike
          </h3>

          {formError && (
            <div className="p-3.5 bg-[#FF5F00] text-white text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 stroke-[3px]" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 bg-[#00FF66] text-black text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[3px]" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateAuction} className="space-y-4 text-black dark:text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Brand / Make</label>
                <input required type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Ducati" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Model</label>
                <input required type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Panigale V4" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Year</label>
                <input required type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2023" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Fuel Type</label>
                <select value={fuel} onChange={e => setFuel(e.target.value)} className="w-full p-3 border-3 border-black dark:border-white bg-white dark:bg-black font-extrabold text-sm outline-none cursor-pointer">
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">KM Driven</label>
                <input required type="number" value={kmDriven} onChange={e => setKmDriven(e.target.value)} placeholder="e.g. 4500" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Ownership</label>
                <select value={ownership} onChange={e => setOwnership(e.target.value)} className="w-full p-3 border-3 border-black dark:border-white bg-white dark:bg-black font-extrabold text-sm outline-none cursor-pointer">
                  <option value="First Owner">First Owner</option>
                  <option value="Second Owner">Second Owner</option>
                  <option value="Third Owner or More">Third Owner or More</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider block">Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Full motorcycle specs and details..." className="neo-input w-full text-sm font-semibold"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Starting Price ($)</label>
                <input required type="number" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} placeholder="1000" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Reserve Price ($)</label>
                <input required type="number" value={reservePrice} onChange={e => setReservePrice(e.target.value)} placeholder="5000" className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Min Increment ($)</label>
                <input required type="number" value={minIncrement} onChange={e => setMinIncrement(e.target.value)} placeholder="100" className="neo-input w-full text-sm font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">Start Time</label>
                <input required type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="neo-input w-full text-sm font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider block">End Time</label>
                <input required type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="neo-input w-full text-sm font-semibold" />
              </div>
            </div>

            {/* Images Upload Frame */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider block">Motorcycle Images</label>
              
              <div className="flex items-center gap-4">
                <label className="px-5 py-3 bg-[#8B5CF6] text-white font-black border-3 border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer flex items-center gap-1.5">
                  <Upload className="h-4 w-4 stroke-[2.5px]" /> {uploading ? 'Uploading...' : 'Choose Images'}
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
              </div>

              {/* Uploaded Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {images.map((url, i) => (
                    <div key={i} className="aspect-video bg-muted border-2 border-black rounded-none overflow-hidden relative group">
                      <img src={getImageUrl(url)} alt="Uploaded preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-[#FF5F00]/90 text-white font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="neo-btn w-full py-4 bg-[#FFDE4D] text-black text-sm font-black mt-4"
            >
              Create Auction Listing
            </button>
          </form>
        </div>

        {/* Existing Listings Manager */}
        <div className="p-6 bg-white dark:bg-[#1A1A1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
          <h3 className="font-black text-sm tracking-wide text-muted-foreground uppercase border-b-3 border-dashed border-black dark:border-white pb-2 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 stroke-[2.5px]" /> Manage listings
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {auctions.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-xs py-3.5 border-b border-black/10 dark:border-white/10 last:border-0 text-black dark:text-white">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-black block truncate uppercase">{item.bike.brand} {item.bike.model}</span>
                  <span className="text-muted-foreground font-semibold">{item.bike.year} • starting: ${item.startingPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 border-2 border-black text-[9px] font-black uppercase ${
                    item.status === 'live' ? 'bg-[#FF007A] text-white' :
                    item.status === 'scheduled' ? 'bg-[#00F0FF] text-black' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.status}
                  </span>
                  {(item.status === 'draft' || item.status === 'scheduled') && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-[#FF5F00] hover:bg-[#FF5F00]/10 border-2 border-transparent hover:border-black rounded-none transition-all cursor-pointer"
                      title="Delete Listing"
                    >
                      <Trash2 className="h-4 w-4 stroke-[2.5px]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
