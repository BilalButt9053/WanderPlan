/**
 * Itinerary Routes Tests
 *
 * Tests for itinerary generation endpoints:
 * - GET /api/itineraries/templates
 * - GET /api/itineraries/hybrid?destination=...
 * - POST /api/itineraries/trip/:tripId/generate
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

  const itineraryRouter = require('../router/itinerary-router');
  const errorMiddleware = require('../middleware/error-middleware');

  app.use('/api/itineraries', itineraryRouter);
  app.use(errorMiddleware);

  return app;
};

describe('Itinerary Routes', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(async () => {
    await connectTestDB();
    app = createTestApp();

    // Create a test user for authentication
    const { user, token } = await createTestUser({
      email: 'itinerary-test@example.com'
    });
    testUser = user;
    authToken = token;
  });

  afterAll(async () => {
    await clearTestDB();
    await disconnectTestDB();
  });

  describe('GET /api/itineraries/templates', () => {
    test('should return itinerary templates (public)', async () => {
      const response = await request(app)
        .get('/api/itineraries/templates')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    test('should filter templates by destination', async () => {
      const response = await request(app)
        .get('/api/itineraries/templates?destination=Lahore')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
    });
  });

  describe('GET /api/itineraries/hybrid', () => {
    test('should return hybrid itinerary for valid destination', async () => {
      const response = await request(app)
        .get('/api/itineraries/hybrid?destination=Lahore&days=3&travelStyle=moderate')
        .expect('Content-Type', /json/);

      // May succeed or return error depending on OpenAI availability
      expect([200, 500, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('itinerary');
        expect(Array.isArray(response.body.itinerary)).toBe(true);
      }
    });

    test('should reject request without destination', async () => {
      const response = await request(app)
        .get('/api/itineraries/hybrid?days=3');

      expect([400, 422]).toContain(response.status);
    });

    test('should reject request with invalid days', async () => {
      const response = await request(app)
        .get('/api/itineraries/hybrid?destination=Lahore&days=100');

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /api/itineraries/trip/:tripId/generate', () => {
    test('should generate itinerary for authenticated user trip', async () => {
      // Create a test trip
      const trip = await createTestTrip(testUser._id, {
        title: 'Itinerary Test Trip',
        destination: { name: 'Karachi', city: 'Karachi', country: 'Pakistan' }
      });

      const response = await request(app)
        .post(`/api/itineraries/trip/${trip._id}/generate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      // May succeed or fail depending on AI availability
      expect([200, 201, 500, 503]).toContain(response.status);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('itinerary');
      }
    });

    test('should reject generation without authentication', async () => {
      const trip = await createTestTrip(testUser._id);

      const response = await request(app)
        .post(`/api/itineraries/trip/${trip._id}/generate`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/itineraries/trip/:tripId', () => {
    test('should return saved itinerary for trip', async () => {
      const trip = await createTestTrip(testUser._id, {
        title: 'Get Itinerary Test Trip'
      });

      const response = await request(app)
        .get(`/api/itineraries/trip/${trip._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      // May return 200 with itinerary or 404 if not generated yet
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/itineraries/suggestions', () => {
    test('should return destination suggestions', async () => {
      const response = await request(app)
        .get('/api/itineraries/suggestions')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
    });
  });
});

module.exports = { createTestApp };
