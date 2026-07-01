import request from 'supertest';
import app from '../app';
import { authService } from '../services/AuthService';

import mongoose from 'mongoose';

// Directly set Mongoose's internal connection state variable to simulate a connected state
(mongoose.connection as any)._readyState = 1;

jest.mock('../services/AuthService');
jest.mock('../config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  disconnectDB: jest.fn().mockResolvedValue(undefined)
}));

describe('Express API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and UP statuses for dependencies', async () => {
      const res = await request(app).get('/health');
      console.log('HEALTH CHECK DIAGNOSTIC:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 when registering a valid user payload', async () => {
      const mockResult: any = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        })
      };
      (authService.register as jest.Mock).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('john@example.com');
      expect(authService.register).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
    });

    it('should return 400 and fail validation if password is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John',
          email: 'john@example.com',
          password: '123' // too short
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details[0].message).toContain('Password must be at least 6 characters');
      expect(authService.register).not.toHaveBeenCalled();
    });
  });
});
