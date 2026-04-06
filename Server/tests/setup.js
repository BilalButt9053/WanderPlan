/**
 * Test Setup - Configures the test environment
 */

const mongoose = require('mongoose');

// Test database URL (use a separate test database)
const TEST_DB_URL = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderplan_test';

/**
 * Connect to test database
 */
const connectTestDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URL);
      console.log('Connected to test database');
    }
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from test database
 */
const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Disconnected from test database');
    }
  } catch (error) {
    console.error('Test database disconnect error:', error);
  }
};

/**
 * Clear all test collections
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Generate a valid JWT token for testing
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { user_id: user._id, email: user.email, isAdmin: user.isAdmin || false },
    process.env.JWT_SECRET_KEY || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

/**
 * Create a test user
 * @returns {Object} Created user with token
 */
const createTestUser = async (overrides = {}) => {
  const Signup = require('../modals/user-modals');
  const bcrypt = require('bcryptjs');

  const defaultUser = {
    fullName: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    isVerified: true,
    isAdmin: false,
    ...overrides
  };

  const user = await Signup.create(defaultUser);
  const token = generateTestToken(user);

  return { user, token };
};

/**
 * Create a test trip
 * @param {string} userId - User ID
 * @returns {Object} Created trip
 */
const createTestTrip = async (userId, overrides = {}) => {
  const Trip = require('../modals/trip-modal');

  const defaultTrip = {
    userId,
    title: 'Test Trip',
    destination: { name: 'Lahore', city: 'Lahore', country: 'Pakistan' },
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalBudget: 50000,
    travelers: 2,
    currency: 'PKR',
    tripType: 'leisure',
    status: 'planning',
    durationDays: 3,
    budgetBreakdown: {
      accommodation: { amount: 20000, percentage: 40, spent: 0 },
      food: { amount: 12500, percentage: 25, spent: 0 },
      transport: { amount: 10000, percentage: 20, spent: 0 },
      activities: { amount: 7500, percentage: 15, spent: 0 }
    },
    ...overrides
  };

  return Trip.create(defaultTrip);
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  generateTestToken,
  createTestUser,
  createTestTrip,
  TEST_DB_URL
};
