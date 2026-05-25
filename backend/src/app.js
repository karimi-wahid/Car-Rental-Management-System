import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import carRouter from './routes/carRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import contactRouter from './routes/contactRoutes.js';

const app = express();

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Security headers ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }),
);

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// ── Rate limiting ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ── Body parsing ──────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Data sanitization ─────────────────────────────────────────
// NoSQL injection
app.use(
  mongoSanitize({
    sanitizeQuery: false,
  }),
);

// XSS — sanitize string fields in req.body
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      if (typeof obj === 'string') return xss(obj);
      if (Array.isArray(obj)) return obj.map(sanitize);
      if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, sanitize(v)]),
        );
      }
      return obj;
    };
    req.body = sanitize(req.body);
  }
  next();
});

// ── Request timestamp ─────────────────────────────────────────
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/favorites', favoriteRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/contact', contactRouter);

// ── 404 handler ───────────────────────────────────────────────
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ── Global error handler ──────────────────────────────────────
app.use(globalErrorHandler);

export default app;
