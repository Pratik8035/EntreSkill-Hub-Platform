// app.js - Express application setup with production-grade middleware and error handling
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const interestRoutes = require('./routes/interestRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const xssSanitizer = require('./middleware/xssSanitizer');
const { sendSuccess } = require('./utils/responseHandler');
const logger = require('./utils/logger');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// ─── Security Headers ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:    ["'self'", 'fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'https:'],
      scriptSrc:  ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some CDN assets
}));

// ─── CORS ──────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(u => u.trim());
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: origin '${origin}' is not permitted.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ─── Compression ───────────────────────────────────────────────────────────
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ─── Request Logger ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV === 'production') {
    // Use pino-http for structured JSON logging in production
    app.use(pinoHttp({ logger }));
  } else {
    // Use morgan for human-readable dev logs
    app.use(morgan('dev'));
  }
}

// ─── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(cookieParser());

// ─── XSS Sanitization ─────────────────────────────────────────────────────
app.use(xssSanitizer);

// ─── Health Probes ─────────────────────────────────────────────────────────
// Liveness — container is alive (no DB needed)
app.get('/api/health/liveness', (req, res) => {
  res.status(200).json({ status: 'alive', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Readiness — app can serve traffic (checks DB connection)
app.get('/api/health/readiness', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0: disconnected | 1: connected | 2: connecting | 3: disconnecting
  if (dbState === 1) {
    return res.status(200).json({ status: 'ready', db: 'connected', timestamp: new Date().toISOString() });
  }
  return res.status(503).json({ status: 'not-ready', db: 'disconnected', timestamp: new Date().toISOString() });
});

// Full health check (legacy endpoint preserved for backwards compatibility)
app.get('/api/health', (req, res) => {
  sendSuccess(res, { uptime: process.uptime(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }, 'API is running smoothly');
});

// ─── Application Routes ────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/roadmaps',     require('./routes/roadmapRoutes'));
app.use('/api/resources',    require('./routes/resourceRoutes'));
app.use('/api/mentors',      require('./routes/mentorRoutes'));
app.use('/api/schemes',      require('./routes/schemeRoutes'));
app.use('/api/funding',      require('./routes/fundingRoutes'));
app.use('/api/network',      require('./routes/networkingRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/ai',           require('./routes/aiRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/profile',      require('./routes/profileRoutes'));
app.use('/api/analytics',    require('./routes/analyticsRoutes'));
app.use('/api/business-plan',require('./routes/businessPlanRoutes'));
app.use('/api/courses',      require('./routes/courseRoutes'));
app.use('/api/lessons',      require('./routes/lessonRoutes'));
app.use('/api/learning',     require('./routes/learningRoutes'));
app.use('/api/quizzes',      require('./routes/quizRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/business-execution', require('./routes/businessExecutionRoutes'));
app.use('/api/notifications',      require('./routes/notificationRoutes'));
app.use('/api/reports',            require('./routes/reportRoutes'));

// ── Sprint 11 ────────────────────────────────────────────────────────────────
app.use('/api/community',          require('./routes/communityRoutes'));
app.use('/api/mentor-sessions',    require('./routes/mentorSessionRoutes'));
app.use('/api/chat',               require('./routes/chatRoutes'));

// ── Sprint 12 ────────────────────────────────────────────────────────────────
app.use('/api/finance',            require('./routes/financialRoutes'));

// Global rate limit (after routes to avoid limiting health probes)
app.use('/api', globalLimiter);

// Skill & interest routes (legacy placement preserved)
app.use('/api/skills',    skillRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/assessment',assessmentRoutes);

// ─── 404 Fallback ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
