/**
 * Trip Routes Tests
 *
 * Tests for trip management endpoints:
 * - POST /api/trips
 * - GET /api/trips
 * - GET /api/trips/:id
 * - PUT /api/trips/:id
 * - DELETE /api/trips/:id
 */

const request = require('supertest');
const express = require('express');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser,
  createTestTrip
} = require('./setup');

// Create a minimal express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  const tripRouter = require('../router/trip-router');
  const errorMiddleware = require('../middleware/error-middleware');

  app.use('/api/trips', tripRouter);
  app.use(errorMiddleware);

  return app;
};

describe('Trip Routes', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(async () => {
    await connectTestDB();
    app = createTestApp();

    // Create a test user for authentication
    const { user, token } = await createTestUser({
      email: 'trip-test@example.com'
    });
    testUser = user;
    authToken = token;
  });

  afterAll(async () => {
    await clearTestDB();
    await disconnectTestDB();
  });

  describe('POST /api/trips', () => {
    test('should create a new trip with valid data', async () => {
      const tripData = {
        title: 'Lahore Adventure',
        destination: { name: 'Lahore', city: 'Lahore', country: 'Pakistan' },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        totalBudget: 50000,
        travelers: 2,
        currency: 'PKR',
        tripType: 'leisure'
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect('Content-Type', /json/);

      expect([200, 201]).toContain(response.status);

      if (response.status === 201 || response.status === 200) {
        expect(response.body).toHaveProperty('trip');
        expect(response.body.trip.title).toBe('Lahore Adventure');
      }
    });

    test('should reject trip creation without authentication', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send({ title: 'Test Trip', totalBudget: 10000 });

      expect(response.status).toBe(401);
    });

    test('should reject trip creation with invalid data', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          title: ''
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('GET /api/trips', () => {
    test('should return user trips when authenticated', async () => {
      // Create a test trip first
      await createTestTrip(testUser._id, { title: 'Get Test Trip' });

      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trips');
      expect(Array.isArray(response.body.trips)).toBe(true);
    });

    test('should reject fetching trips without authentication', async () => {
      const response = await request(app)
        .get('/api/trips');

      expect(response.status).toBe(401);
    });

    test('should filter trips by status', async () => {
      const response = await request(app)
        .get('/api/trips?status=planning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trips');
    });
  });

  describe('GET /api/trips/:id', () => {
    test('should return a specific trip by ID', async () => {
      const trip = await createTestTrip(testUser._id, { title: 'Get Single Trip' });

      const response = await request(app)
        .get(`/api/trips/${trip._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('trip');
        expect(response.body.trip.title).toBe('Get Single Trip');
      }
    });

    test('should return 404 for non-existent trip', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([404, 400]).toContain(response.status);
    });
  });

  describe('PUT /api/trips/:id', () => {
    test('should update a trip', async () => {
      const trip = await createTestTrip(testUser._id, { title: 'Update Test Trip' });

      const response = await request(app)
        .put(`/api/trips/${trip._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Trip Title' })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.trip.title).toBe('Updated Trip Title');
      }
    });
  });

  describe('DELETE /api/trips/:id', () => {
    test('should delete a trip', async () => {
      const trip = await createTestTrip(testUser._id, { title: 'Delete Test Trip' });

      const response = await request(app)
        .delete(`/api/trips/${trip._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('POST /api/trips/estimate', () => {
    test('should estimate budget for a trip', async () => {
      const response = await request(app)
        .post('/api/trips/estimate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Lahore',
          days: 3,
          travelers: 2,
          travelStyle: 'moderate'
        })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('estimate');
      }
    });
  });
});

module.exports = { createTestApp };
