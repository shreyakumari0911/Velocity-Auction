import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/UserRepository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { Session } from '../models/Session';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';

export class AuthService {
  async register(name: string, email: string, password: string): Promise<IUser> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = email.toLowerCase().endsWith('@velocityauction.com') ? 'admin' : 'user';
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role
    });

    logger.info(`User registered successfully: ${user._id}`);
    return user;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: Omit<IUser, 'passwordHash'> }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const payload = { userId: user._id.toString() as string, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token in MongoDB Session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });

    const userObj = user.toObject ? user.toObject() : user;
    const { passwordHash, ...safeUser } = userObj as any;

    logger.info(`User logged in: ${user._id}`);
    return { accessToken, refreshToken, user: safeUser };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      const session = await Session.findOne({ token });

      if (!session || session.userId.toString() !== decoded.userId) {
        throw new Error('Invalid or expired refresh token');
      }

      // Rotate tokens
      const payload = { userId: decoded.userId, role: decoded.role };
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      // Rotate session in MongoDB
      await Session.deleteOne({ token });
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await Session.create({
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.warn(`Token refresh failed: ${(error as Error).message}`);
      throw new Error('Authentication failed');
    }
  }

  async logout(token: string): Promise<void> {
    await Session.deleteOne({ token });
    logger.info('User logged out');
  }
}

export const authService = new AuthService();
