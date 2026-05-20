import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
//import xss from 'xss-clean';
//import hpp from 'hpp';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import carRouter from './routes/carRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import contactRouter from './routes/contactRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import commentRouter from './routes/commentRoutes.js';

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again in an hour!',
});
app.use('/api/auth', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());

app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// Data Sanitization against NoSQL query injection
app.use(
  mongoSanitize({
    sanitizeQuery: false,
  }),
);

// Data sanitization against XSS
//app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   }),
// );

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/favorites', favoriteRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/comments', commentRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
