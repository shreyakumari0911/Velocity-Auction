import { Schema, model, Document, Types } from 'mongoose';

export interface IAuction extends Document {
  bike: Types.ObjectId;
  startingPrice: number;
  reservePrice: number;
  minIncrement: number;
  startTime: Date;
  endTime: Date;
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'sold';
  highestBid: Types.ObjectId | null;
  highestBidAmount: number;
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    bike: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
    startingPrice: { type: Number, required: true, min: 0 },
    reservePrice: { type: Number, required: true, min: 0 },
    minIncrement: { type: Number, required: true, min: 1 },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'live', 'ended', 'sold'],
      default: 'draft',
      index: true
    },
    highestBid: { type: Schema.Types.ObjectId, ref: 'Bid', default: null },
    highestBidAmount: { type: Number, default: 0 },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  {
    timestamps: true
  }
);

// Compound index for querying live/scheduled auctions efficiently
AuctionSchema.index({ status: 1, startTime: 1, endTime: 1 });

export const Auction = model<IAuction>('Auction', AuctionSchema);
