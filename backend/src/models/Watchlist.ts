import { Schema, model, Document, Types } from 'mongoose';

export interface IWatchlist extends Document {
  user: Types.ObjectId;
  auctions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    auctions: [{ type: Schema.Types.ObjectId, ref: 'Auction' }]
  },
  {
    timestamps: true
  }
);

export const Watchlist = model<IWatchlist>('Watchlist', WatchlistSchema);
