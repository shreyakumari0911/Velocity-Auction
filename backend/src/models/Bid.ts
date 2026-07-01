import { Schema, model, Document, Types } from 'mongoose';

export interface IBid extends Document {
  auction: Types.ObjectId;
  bidder: Types.ObjectId;
  amount: number;
  timestamp: Date;
  status: 'success' | 'outbid' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: ['success', 'outbid', 'rejected'], default: 'success' }
  },
  {
    timestamps: true
  }
);

// Compound index for querying a sorted history of bids for an auction
BidSchema.index({ auction: 1, amount: -1 });

export const Bid = model<IBid>('Bid', BidSchema);
