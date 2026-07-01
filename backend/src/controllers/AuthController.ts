import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/AuthService';
import { bidService } from '../services/BidService';
import { auctionRepository } from '../repositories/AuctionRepository';
import { userRepository } from '../repositories/UserRepository';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      
      const { passwordHash, ...safeUser } = user.toObject() as any;
      res.status(201).json({
        message: 'Registration successful',
        user: safeUser
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.login(email, password);

      // Set Refresh Token as HTTP-Only Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        message: 'Login successful',
        accessToken,
        user
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async refresh(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) {
        res.status(401).json({ error: 'Refresh token is required' });
        return;
      }

      const { accessToken, refreshToken } = await authService.refresh(token);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        accessToken
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (token) {
        await authService.logout(token);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { passwordHash, ...safeUser } = user.toObject() as any;
      res.status(200).json({ user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  async getMyBids(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const bids = await bidService.getBidsByUser(userId);
      res.status(200).json({ bids });
    } catch (error) {
      next(error);
    }
  }

  async getWonAuctions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const wonAuctions = await auctionRepository.findWonAuctions(userId);
      res.status(200).json({ wonAuctions });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
