import { Schema, model } from 'mongoose';

export interface IBike {
  _id?: any;
  brand: string;
  model: string;
  year: number;
  fuel: 'Petrol' | 'Electric' | 'Diesel' | 'CNG';
  kmDriven: number;
  ownership: 'First Owner' | 'Second Owner' | 'Third Owner or More';
  images: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const BikeSchema = new Schema<IBike>(
  {
    brand: { type: String, required: true, index: true, trim: true },
    model: { type: String, required: true, index: true, trim: true },
    year: { type: Number, required: true, min: 1900 },
    fuel: { type: String, enum: ['Petrol', 'Electric', 'Diesel', 'CNG'], required: true },
    kmDriven: { type: Number, required: true, min: 0 },
    ownership: { type: String, enum: ['First Owner', 'Second Owner', 'Third Owner or More'], required: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const Bike = model<IBike>('Bike', BikeSchema);
