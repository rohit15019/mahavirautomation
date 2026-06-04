const mongoose = require('mongoose');

const seedAdmin = async () => {
  try {
    const User = require('../models/user.model');
    const adminEmail = 'mahavirautomation111@gmail.com';
    const adminPassword = 'M9#xT4';
    
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin user found. Verifying role and status...');
      admin.role = 'Admin';
      admin.isVerified = true;
      await admin.save();
      console.log('Admin user verified successfully.');
    } else {
      console.log('Admin user not found. Creating a new admin user...');
      
      // Ensure unique mobile.
      let mobile = '9999999999';
      let mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        mobile = '1111111111'; // fallback
        mobileExists = await User.findOne({ mobile });
        if (mobileExists) {
          mobile = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        }
      }

      admin = new User({
        firstName: 'Admin',
        lastName: 'Mahavir',
        email: adminEmail,
        mobile: mobile,
        password: adminPassword,
        role: 'Admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }

    // Fix incorrect admin
    const wrongAdmin = await User.findOne({ email: 'yugd2272@gmail.com' });
    if (wrongAdmin && wrongAdmin.role === 'Admin') {
      wrongAdmin.role = 'User';
      await wrongAdmin.save();
      console.log('Successfully demoted yugd2272@gmail.com to User role.');
    }

  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('========================================================================');
      console.error('CRITICAL ERROR: MONGODB_URI environment variable is missing.');
      console.error('To run Mahavir Automation in production / live mode, you must set the');
      console.error('MONGODB_URI environment variable (e.g. your MongoDB Atlas URI).');
      console.error('For local development, ensure that a .env file exists in the back-end');
      console.error('directory with the variable PORT, MONGODB_URI, and JWT_SECRET defined.');
      console.error('========================================================================');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run admin seed
    await seedAdmin();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
