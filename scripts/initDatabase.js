const mongoose = require('mongoose');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';

async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create tenants
    const acmeTenant = await Tenant.findOneAndUpdate(
      { slug: 'acme' },
      {
        name: 'Acme Corporation',
        slug: 'acme',
        subscription: 'free',
        noteLimit: 3
      },
      { upsert: true, new: true }
    );

    const globexTenant = await Tenant.findOneAndUpdate(
      { slug: 'globex' },
      {
        name: 'Globex Corporation',
        slug: 'globex',
        subscription: 'free',
        noteLimit: 3
      },
      { upsert: true, new: true }
    );

    console.log('Tenants created/updated:', { acmeTenant, globexTenant });

    // Create test users
    const testUsers = [
      {
        email: 'admin@acme.test',
        password: 'password',
        role: 'admin',
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: 'member',
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: 'admin',
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: 'member',
        tenantId: globexTenant._id
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Database initialization completed successfully!');
    console.log('\nTest accounts created:');
    console.log('admin@acme.test (Admin, tenant: Acme) - password: password');
    console.log('user@acme.test (Member, tenant: Acme) - password: password');
    console.log('admin@globex.test (Admin, tenant: Globex) - password: password');
    console.log('user@globex.test (Member, tenant: Globex) - password: password');

  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

initDatabase();
