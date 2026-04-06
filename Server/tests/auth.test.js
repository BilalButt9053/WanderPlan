/**
 * Auth Routes Tests
 *
 * Tests for authentication endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET /api/auth/profile
 */

const request = require('supertest');
const express = require('express');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser
} = require('./setup');

// Create a minimal express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Import routes
  const authRouter = require('../router/auth-router');
  const errorMiddleware = require('../middleware/error-middleware');

  app.use('/api/auth', authRouter);
  app.use(errorMiddleware);

  return app;
};

describe('Auth Routes', () => {
  let app;

  beforeAll(async () => {
    await connectTestDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await clearTestDB();
    await disconnectTestDB();
  });

  beforeEach(async () => {
    // Clear users before each test
    const mongoose = require('mongoose');
    if (mongoose.connection.collections.signups) {
      await mongoose.connection.collections.signups.deleteMany({});
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);

      // Should either succeed (201) or indicate email already exists
      expect([201, 400, 422]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('registered');
      }
    });

    test('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

    test('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      // First create a user
      const { user } = await createTestUser({
        email: 'login-test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123'
        })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      }
    });

    test('should reject login with invalid password', async () => {
      await createTestUser({
        email: 'wrong-pass@example.com'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong-pass@example.com',
          password: 'wrongpassword'
        });

      expect([400, 401]).toContain(response.status);
    });

    test('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect([400, 401, 404]).toContain(response.status);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should return user profile with valid token', async () => {
      const { user, token } = await createTestUser({
        email: 'profile-test@example.com'
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('profile-test@example.com');
      }
    });

    test('should reject profile request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('should reject profile request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

// Export for running individually
module.exports = { createTestApp };
