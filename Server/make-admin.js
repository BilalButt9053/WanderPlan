const mongoose = require('mongoose');
const Signup = require('./modals/user-modals');
require('dotenv').config();

/**
 * Script to make a user admin by email
 * Usage: node make-admin.js <email>
 * Example: node make-admin.js admin@wanderplan.com
 */

const makeUserAdmin = async (email) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await Signup.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update isAdmin to true
    user.isAdmin = true;
    await user.save();

    console.log(`✅ User ${user.fullName} (${email}) is now an admin!`);
    console.log(`User ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`isAdmin: ${user.isAdmin}`);
    console.log(`isVerified: ${user.isVerified}`);

    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js admin@wanderplan.com');
  process.exit(1);
}

makeUserAdmin(email);
