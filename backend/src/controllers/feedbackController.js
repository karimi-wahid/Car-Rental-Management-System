import Feedback from '../models/feedbackModel.js';
import { Booking } from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ===================== USER =====================

// Create feedback — only allowed after a completed booking
export const createFeedback = catchAsync(async (req, res, next) => {
  const { carId, bookingId, rating, title, comment } = req.body;
  const userId = req.user.id;

  // Verify the booking exists, belongs to this user, and is completed
  const booking = await Booking.findOne({
    _id: bookingId,
    user: userId,
    car: carId,
    status: 'completed',
  });

  if (!booking) {
    return next(
      new AppError(
        'You can only review a car after completing a booking for it.',
        403,
      ),
    );
  }

  // Check for duplicate review on this booking
  const existing = await Feedback.findOne({ booking: bookingId });
  if (existing) {
    return next(
      new AppError(
        'You have already submitted a review for this booking.',
        400,
      ),
    );
  }

  const feedback = await Feedback.create({
    user: userId,
    car: carId,
    booking: bookingId,
    rating,
    title,
    comment,
  });

  await feedback.populate('user', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { feedback },
  });
});

// Get all approved feedback for a car
export const getCarFeedback = catchAsync(async (req, res, next) => {
  const { carId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [feedback, total, ratingStats] = await Promise.all([
    Feedback.find({ car: carId, status: 'approved' })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar'),

    Feedback.countDocuments({ car: carId, status: 'approved' }),

    Feedback.aggregate([
      {
        $match: { car: new mongoose.Types.ObjectId(carId), status: 'approved' },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Build rating breakdown { 5: 12, 4: 8, 3: 2, 2: 0, 1: 1 }
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingStats.forEach(({ _id, count }) => {
    breakdown[_id] = count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      feedback,
      ratingBreakdown: breakdown,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// Get current user's own feedback
export const getMyFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('car', 'name brand carModel images');

  res.status(200).json({
    status: 'success',
    results: feedback.length,
    data: { feedback },
  });
});

// Update own feedback (only if still pending)
export const updateFeedback = catchAsync(async (req, res, next) => {
  const { rating, title, comment } = req.body;

  const feedback = await Feedback.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!feedback) {
    return next(new AppError('No feedback found with that ID.', 404));
  }

  if (feedback.status === 'approved') {
    return next(new AppError('Approved reviews cannot be edited.', 400));
  }

  feedback.rating = rating ?? feedback.rating;
  feedback.title = title ?? feedback.title;
  feedback.comment = comment ?? feedback.comment;
  feedback.status = 'pending'; // re-queue for approval on edit
  await feedback.save();

  res.status(200).json({
    status: 'success',
    data: { feedback },
  });
});

// Delete own feedback
export const deleteFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!feedback) {
    return next(new AppError('No feedback found with that ID.', 404));
  }

  await Feedback.calcAverageRating(feedback.car);

  res.status(204).json({ status: 'success', data: null });
});

// ===================== ADMIN =====================

// Get all feedback with filters
export const getAllFeedback = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status) filter.status = status;

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email avatar')
      .populate('car', 'name brand')
      .populate('booking', 'startDate endDate totalPrice'),

    Feedback.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// Approve or reject feedback
export const moderateFeedback = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Status must be approved or rejected.', 400));
  }

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!feedback) {
    return next(new AppError('No feedback found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { feedback },
  });
});

// Admin reply to a review
export const replyToFeedback = catchAsync(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply?.trim()) {
    return next(new AppError('Please provide a reply.', 400));
  }

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminReply: reply, adminRepliedAt: new Date() },
    { new: true },
  ).populate('user', 'name avatar');

  if (!feedback) {
    return next(new AppError('No feedback found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { feedback },
  });
});
