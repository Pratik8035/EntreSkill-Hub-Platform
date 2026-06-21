const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const { runSeed } = require('./src/config/seed');

// Startup validation check: Ensure critical environment variables exist
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not defined in the environment variables (.env file).');
  process.exit(1);
}

// Connect to MongoDB Database and seed reference data in development
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    await runSeed();
  }
});

// Fetch PORT from configuration
const PORT = process.env.PORT || 5000;

// Start Express Listener
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown handler
const gracefulExit = async (signal) => {
  console.log(`\n[SYSTEM] Received ${signal}. Starting graceful shutdown...`);
  
  // Close Express server first to stop accepting new requests
  server.close(async () => {
    console.log('[SYSTEM] HTTP server closed.');
    
    // Close MongoDB connection
    await disconnectDB();
    
    console.log('[SYSTEM] Graceful shutdown completed. Exiting.');
    process.exit(0);
  });

  // Force exit after 10s if shutdown hangs
  setTimeout(() => {
    console.error('[SYSTEM] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGINT', () => gracefulExit('SIGINT'));
process.on('SIGTERM', () => gracefulExit('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[ERROR] Unhandled Rejection: ${err.message}`);
  // Close server and exit
  server.close(() => process.exit(1));
});
