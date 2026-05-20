import { Booking } from '../models/bookingModel.js';
import { Car } from '../models/carModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/email.js';
import emailTemplates from '../templates/EmailTemplate.js';

const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ── Helper: overlap query ─────────────────────────────────────
const overlapQuery = (carId, start, end, excludeId = null) => ({
  car: carId,
  status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
  ...(excludeId && { _id: { $ne: excludeId } }),
  startDate: { $lt: end },
  endDate: { $gt: start },
});

// ── Helper: notify user of status change ──────────────────────
async function sendStatusUpdateNotification(booking, oldStatus, newStatus) {
  const statusLabels = {
    confirmed: 'تایید شد',
    in_progress: 'شروع شد',
    completed: 'تکمیل شد',
    cancelled: 'لغو شد',
  };

  if (!statusLabels[newStatus]) return;

  await sendEmail({
    email: booking.user.email,
    subject: `وضعیت رزرو شما ${statusLabels[newStatus]}`,
    html: `
      <div style="font-family: sans-serif; direction: rtl; padding: 24px; max-width: 600px; margin: 0 auto;">
        <h2>سلام ${booking.user.name}،</h2>
        <p>وضعیت رزرو شما برای <strong>${booking.car.name}</strong> به <strong>${statusLabels[newStatus]}</strong> تغییر کرد.</p>
        <p style="color:#888; font-size:13px;">شماره رزرو: ${booking._id}</p>
      </div>
    `,
  });
}

// ══════════════════════════════════════════════════════════════
// USER
// ══════════════════════════════════════════════════════════════

export const createBooking = catchAsync(async (req, res, next) => {
  const { carId, startDate, endDate } = req.body;
  const userId = req.user.id;

  if (!carId || !startDate || !endDate) {
    return next(
      new AppError('Please provide car ID, start date and end date', 400),
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start) || isNaN(end))
    return next(new AppError('Invalid date format', 400));
  if (start < now)
    return next(new AppError('Start date cannot be in the past', 400));
  if (end <= start)
    return next(new AppError('End date must be after start date', 400));

  const car = await Car.findById(carId);
  if (!car) return next(new AppError('Car not found', 404));
  if (!car.availability)
    return next(new AppError('This car is not available for booking', 400));

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = days * car.pricePerDay;

  const overlapping = await Booking.findOne(overlapQuery(carId, start, end));
  if (overlapping)
    return next(
      new AppError('Car is already booked for the selected dates', 400),
    );

  const booking = await Booking.create({
    user: userId,
    car: carId,
    startDate: start,
    endDate: end,
    totalPrice,
    status: BookingStatus.PENDING,
  });

  await booking.populate([
    { path: 'user', select: 'name email avatar' },
    { path: 'car', select: 'name brand carModel images pricePerDay' },
  ]);

  res.status(201).json({ status: 'success', data: { booking } });
});

// ── My bookings (paginated list) ──────────────────────────────
export const getMyBookings = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const {
    status,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    startDate,
    endDate,
    minPrice,
    maxPrice,
  } = req.query;

  const query = { user: userId };
  if (status) query.status = { $in: status.split(',') };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (minPrice || maxPrice) {
    query.totalPrice = {};
    if (minPrice) query.totalPrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.totalPrice.$lte = parseFloat(maxPrice);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('car', 'name brand carModel images pricePerDay year')
      .populate('user', 'name email avatar'),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// ── User dashboard history ────────────────────────────────────
export const getUserBookingHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const [stats, upcomingBookings, recentBookings] = await Promise.all([
    Booking.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]),
    Booking.find({
      user: userId,
      status: { $in: ['confirmed', 'pending'] },
      startDate: { $gt: new Date() },
    })
      .sort('startDate')
      .limit(5)
      .populate('car', 'name brand carModel images pricePerDay year'),
    Booking.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .populate('car', 'name brand carModel images pricePerDay year'),
  ]);

  const overall = stats[0] || {
    totalBookings: 0,
    totalSpent: 0,
    completedTrips: 0,
  };

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalBookings: overall.totalBookings,
        totalSpent: overall.totalSpent,
        upcomingTrips: upcomingBookings.length,
        completedTrips: overall.completedTrips,
      },
      upcomingBookings,
      recentBookings,
    },
  });
});

export const getBookingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('Invalid booking ID', 400));

  const booking = await Booking.findById(id)
    .populate('user', 'name email avatar phone address')
    .populate(
      'car',
      'name brand carModel images pricePerDay year seats transmission',
    );

  if (!booking) return next(new AppError('No booking found with that ID', 404));

  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id)
    return next(
      new AppError('You do not have permission to view this booking', 403),
    );

  res.status(200).json({
    status: 'success',
    data: { booking, userRole: req.user.role },
  });
});

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('Invalid booking ID', 400));

  const booking = await Booking.findById(id);
  if (!booking) return next(new AppError('No booking found with that ID', 404));

  const isOwner = booking.user._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin)
    return next(
      new AppError('You do not have permission to cancel this booking', 403),
    );

  if (booking.status === 'cancelled')
    return next(new AppError('This booking is already cancelled', 400));

  if (['completed', 'in_progress'].includes(booking.status))
    return next(new AppError(`Cannot cancel a ${booking.status} booking`, 400));

  const hoursUntilStart =
    (new Date(booking.startDate) - new Date()) / (1000 * 60 * 60);

  if (!isAdmin && hoursUntilStart < 24)
    return next(
      new AppError(
        `Bookings can only be cancelled at least 24 hours before start time. You have ${Math.max(0, Math.floor(hoursUntilStart))} hours remaining.`,
        400,
      ),
    );

  if (!cancellationReason || cancellationReason.trim().length < 5)
    return next(
      new AppError(
        'Please provide a cancellation reason (minimum 5 characters)',
        400,
      ),
    );

  const daysUntilStart = hoursUntilStart / 24;
  let refundPercentage = 0;

  if (!isAdmin) {
    if (daysUntilStart >= 7) refundPercentage = 100;
    else if (daysUntilStart >= 3) refundPercentage = 50;
    else if (daysUntilStart >= 1) refundPercentage = 25;
  } else {
    refundPercentage = 100;
  }

  const refundAmount = (booking.totalPrice * refundPercentage) / 100;

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = cancellationReason;
  await booking.save();

  await booking.populate([
    { path: 'user', select: 'name email avatar phone' },
    { path: 'car', select: 'name brand carModel images pricePerDay' },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking,
      refund: {
        eligible: refundAmount > 0,
        amount: refundAmount,
        percentage: refundPercentage,
        currency: 'AFN',
        message:
          refundAmount > 0
            ? `${refundAmount} AFN will be refunded within 5-7 business days`
            : 'No refund is available for this cancellation',
      },
    },
  });
});

export const checkCarAvailability = catchAsync(async (req, res, next) => {
  const { carId, startDate, endDate } = req.query;

  if (!startDate || !endDate)
    return next(new AppError('Please provide start date and end date', 400));

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start) || isNaN(end))
    return next(new AppError('Invalid date format', 400));
  if (start < now)
    return next(new AppError('Start date cannot be in the past', 400));
  if (end <= start)
    return next(new AppError('End date must be after start date', 400));

  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (durationDays > 30)
    return next(new AppError('Maximum booking duration is 30 days', 400));

  if (carId) {
    const car = await Car.findById(carId);
    if (!car) return next(new AppError('Car not found', 404));
    if (!car.availability) {
      return res.status(200).json({
        status: 'success',
        data: {
          available: false,
          message: 'This car is not available for booking',
        },
      });
    }
  }

  const overlapping = await Booking.find({
    ...(carId && { car: carId }),
    status: { $in: ['confirmed', 'in_progress'] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  }).populate('car', 'name brand carModel images');

  const isAvailable = overlapping.length === 0;

  res.status(200).json({
    status: 'success',
    data: {
      available: isAvailable,
      startDate: start,
      endDate: end,
      durationDays,
      ...(!isAvailable && {
        conflictingBookings: overlapping.map((b) => ({
          _id: b._id,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      }),
    },
  });
});

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════

export const getAllBookings = catchAsync(async (req, res, next) => {
  const {
    status,
    carId,
    startDate,
    endDate,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (carId) query.car = carId;
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email avatar phone')
      .populate('car', 'name brand carModel images pricePerDay year'),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

export const updateBookingStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    status,
    adminNotes,
    cancellationReason,
    sendNotification = true,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError('Invalid booking ID', 400));

  const validStatuses = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ];
  if (!validStatuses.includes(status))
    return next(
      new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400,
      ),
    );

  const booking = await Booking.findById(id)
    .populate('user', 'name email phone')
    .populate('car', 'name brand carModel pricePerDay');

  if (!booking) return next(new AppError('No booking found with that ID', 404));

  const oldStatus = booking.status;

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(status))
    return next(
      new AppError(
        `Invalid status transition from ${oldStatus} to ${status}`,
        400,
      ),
    );

  booking.status = status;

  if (status === 'cancelled') {
    if (!cancellationReason)
      return next(
        new AppError(
          'Cancellation reason is required when cancelling a booking',
          400,
        ),
      );
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason;
  }
  if (status === 'completed') booking.completedAt = new Date();
  if (status === 'in_progress') booking.startedAt = new Date();
  if (status === 'confirmed') booking.confirmedAt = new Date();
  if (adminNotes) booking.adminNotes = adminNotes;

  await booking.save();

  if (sendNotification === true || sendNotification === 'true') {
    sendStatusUpdateNotification(booking, oldStatus, status).catch((err) =>
      console.error('Notification failed:', err),
    );
  }

  await booking.populate([
    { path: 'user', select: 'name email avatar phone' },
    { path: 'car', select: 'name brand carModel images pricePerDay' },
  ]);

  res.status(200).json({
    status: 'success',
    message: `Booking status updated from ${oldStatus} to ${status}`,
    data: {
      booking,
      notificationSent:
        sendNotification === true || sendNotification === 'true',
    },
  });
});

export const getBookingStatistics = catchAsync(async (req, res, next) => {
  const {
    startDate,
    endDate,
    groupBy = 'day',
    includeDetails = false,
  } = req.query;

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  } else {
    matchStage.createdAt = { $gte: defaultStart };
  }

  const getGroupId = (gb) => {
    switch (gb) {
      case 'week':
        return { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
      case 'month':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
      case 'year':
        return { year: { $year: '$createdAt' } };
      default:
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
    }
  };

  const getPeriod = (gb) => {
    switch (gb) {
      case 'week':
        return { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      case 'month':
        return { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      case 'year':
        return { $dateToString: { format: '%Y', date: '$createdAt' } };
      default:
        return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }
  };

  const [statistics, previousStats] = await Promise.all([
    Booking.aggregate([
      { $match: matchStage },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' },
                averageBookingValue: { $avg: '$totalPrice' },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
              },
            },
          ],
          trends: [
            {
              $group: {
                _id: getGroupId(groupBy),
                period: { $first: getPeriod(groupBy) },
                bookings: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topCars: [
            {
              $group: {
                _id: '$car',
                bookings: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
              },
            },
            { $sort: { bookings: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'cars',
                localField: '_id',
                foreignField: '_id',
                as: 'carDetails',
              },
            },
            { $unwind: '$carDetails' },
            {
              $project: {
                name: '$carDetails.name',
                brand: '$carDetails.brand',
                bookings: 1,
                revenue: 1,
              },
            },
          ],
          cancellations: [
            { $match: { status: 'cancelled' } },
            {
              $group: {
                _id: null,
                totalCancellations: { $sum: 1 },
                totalRefundAmount: { $sum: '$totalPrice' },
              },
            },
          ],
        },
      },
    ]),
    // Previous period for growth
    (async () => {
      const prevStart = new Date(startDate || defaultStart);
      const prevEnd = new Date(endDate || new Date());
      const duration = prevEnd - prevStart;
      prevStart.setTime(prevStart.getTime() - duration);
      prevEnd.setTime(prevEnd.getTime() - duration);
      const res = await Booking.aggregate([
        { $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
          },
        },
      ]);
      return res[0] || { totalBookings: 0, totalRevenue: 0 };
    })(),
  ]);

  const result = statistics[0];
  const overall = result.overall[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
  };

  const growth = (prev, curr) =>
    !prev ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
  const pct = (v, t) => (t === 0 ? 0 : Math.round((v / t) * 100));

  res.status(200).json({
    status: 'success',
    data: {
      period: { from: startDate || defaultStart, to: endDate || new Date() },
      overview: {
        totalBookings: overall.totalBookings,
        totalRevenue: overall.totalRevenue,
        averageBookingValue:
          Math.round(overall.averageBookingValue * 100) / 100,
        revenueGrowth: growth(previousStats.totalRevenue, overall.totalRevenue),
        bookingsGrowth: growth(
          previousStats.totalBookings,
          overall.totalBookings,
        ),
      },
      statusBreakdown: result.byStatus,
      trends: result.trends,
      topCars: result.topCars,
      cancellations: result.cancellations[0] || {
        totalCancellations: 0,
        totalRefundAmount: 0,
      },
      cancellationRate: pct(
        result.cancellations[0]?.totalCancellations || 0,
        overall.totalBookings,
      ),
      completionRate: pct(
        result.byStatus.find((s) => s._id === 'completed')?.count || 0,
        overall.totalBookings,
      ),
    },
  });
});
