import { Bike, IBike } from '../models/Bike';

export class BikeRepository {
  async findById(id: string): Promise<IBike | null> {
    return Bike.findById(id).exec();
  }

  async create(bikeData: Partial<IBike>): Promise<IBike> {
    const bike = new Bike(bikeData);
    return bike.save();
  }

  async update(id: string, bikeData: Partial<IBike>): Promise<IBike | null> {
    return Bike.findByIdAndUpdate(id, bikeData, { new: true }).exec();
  }

  async delete(id: string): Promise<IBike | null> {
    return Bike.findByIdAndDelete(id).exec();
  }
}
export const bikeRepository = new BikeRepository();
