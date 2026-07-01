import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { auctionService } from '../services/AuctionService';
import { adminService } from '../services/AdminService';

export class AdminController {
  async getDashboard(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await adminService.getDashboardMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }

  async createAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        brand,
        model,
        year,
        fuel,
        kmDriven,
        ownership,
        images,
        description,
        startingPrice,
        reservePrice,
        minIncrement,
        startTime,
        endTime
      } = req.body;

      const bikeData = { brand, model, year, fuel, kmDriven, ownership, images, description };
      const auctionData = { startingPrice, reservePrice, minIncrement, startTime, endTime };

      const auction = await auctionService.createAuction(userId, bikeData, auctionData);

      res.status(201).json({
        message: 'Auction created successfully',
        auction
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { id } = req.params;

      if (!userId || !userRole) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        brand,
        model,
        year,
        fuel,
        kmDriven,
        ownership,
        images,
        description,
        startingPrice,
        reservePrice,
        minIncrement,
        startTime,
        endTime
      } = req.body;

      const bikeUpdates = { brand, model, year, fuel, kmDriven, ownership, images, description };
      const auctionUpdates = { startingPrice, reservePrice, minIncrement, startTime, endTime };

      // Filter out undefined fields for update
      const cleanedBikeUpdates = Object.fromEntries(
        Object.entries(bikeUpdates).filter(([_, v]) => v !== undefined)
      );
      const cleanedAuctionUpdates = Object.fromEntries(
        Object.entries(auctionUpdates).filter(([_, v]) => v !== undefined)
      );

      const auction = await auctionService.updateAuction(
        id,
        userId,
        userRole,
        cleanedBikeUpdates,
        cleanedAuctionUpdates
      );

      res.status(200).json({
        message: 'Auction updated successfully',
        auction
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { id } = req.params;

      if (!userId || !userRole) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await auctionService.deleteAuction(id, userId, userRole);

      res.status(200).json({ message: 'Auction deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async uploadImages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      // Generate relative URLs for cloud serving compatibility
      const imageUrls = files.map((file) => `/uploads/${file.filename}`);

      res.status(200).json({
        message: 'Images uploaded successfully',
        urls: imageUrls
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
