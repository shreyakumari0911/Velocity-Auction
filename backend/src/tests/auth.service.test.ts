import { authService } from '../services/AuthService';
import { userRepository } from '../repositories/UserRepository';
import { Session } from '../models/Session';
import bcrypt from 'bcryptjs';

jest.mock('../repositories/UserRepository');
jest.mock('../models/Session');
jest.mock('bcryptjs');

describe('AuthService', () => {
  const mockUser: any = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed_password',
    role: 'user',
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        passwordHash: this.passwordHash,
        role: this.role
      };
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully when email is unique', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register('John Doe', 'john@example.com', 'password123');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        role: 'user'
      });
      expect(result).toBe(mockUser);
    });

    it('should throw an error if the email is already registered', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.register('John Doe', 'john@example.com', 'password123')
      ).rejects.toThrow('Email already registered');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (Session.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login('john@example.com', 'password123');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(Session.create).toHaveBeenCalled(); // Saves refresh token to Session
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw an error if password does not match', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('john@example.com', 'wrong_password')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
