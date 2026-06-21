const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');

const MONGOOSE_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

const getDbState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] || 'unknown';
};

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/entreskill';

    console.log('================================');
    console.log('__dirname =', __dirname);
    console.log('MONGO_URI =', process.env.MONGO_URI);
    console.log('Using URI =', uri);
    console.log('================================');

    console.log('[DB] Connecting to MongoDB...');

    const conn = await mongoose.connect(uri, MONGOOSE_OPTIONS);

    console.log(
      `[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    const checkCollection =
      conn.connection.db.collection('startup_checks');

    await checkCollection.updateOne(
      { _id: 'startup_status' },
      {
        $set: {
          status: 'active',
          initializedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(
      '[DB] Startup check completed: entreskill database is initialized/accessible'
    );
  } catch (error) {
    console.error('[DB] MongoDB Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('[DB] Connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] Connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] Runtime Error:', err);
});

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[DB] MongoDB connection closed');
  } catch (error) {
    console.error('[DB] Error closing connection:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getDbState,
};