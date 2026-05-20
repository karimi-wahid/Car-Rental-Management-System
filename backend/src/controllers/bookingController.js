import { Booking } from '../models/bookingModel.js';
import { Car } from '../models/carModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// Define BookingStatus if not imported from elsewhere
const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const createBooking = catchAsync(async (req, res, next) => {
  const { carId, startDate, endDate } = req.body;
  console.log(carId, startDate, endDate);
  const userId = req.user.id;

  // Validate required fields
  if (!carId || !startDate || !endDate) {
    return next(
      new AppError('Please provide car ID, start date and end date', 400),
    );
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    return next(new AppError('Start date cannot be in the past', 400));
  }

  if (end <= start) {
    return next(new AppError('End date must be after start date', 400));
  }

  // Check if car exists
  const car = await Car.findById(carId);
  if (!car) {
    return next(new AppError('Car not found', 404));
  }

  // Check if car is available for booking
  if (!car.availability) {
    return next(new AppError('This car is not available for booking', 400));
  }

  // Calculate total price
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = days * car.pricePerDay;

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
    $or: [
      {
        startDate: { $lt: end },
        endDate: { $gt: start },
      },
      {
        startDate: { $gte: start, $lt: end },
      },
      {
        endDate: { $gt: start, $lte: end },
      },
    ],
  });

  if (overlappingBooking) {
    return next(
      new AppError('Car is already booked for the selected dates', 400),
    );
  }

  // Create booking
  const booking = await Booking.create({
    user: userId,
    car: carId,
    startDate: start,
    endDate: end,
    totalPrice,
    status: BookingStatus.PENDING,
  });

  // Populate user and car details for response
  await booking.populate([
    { path: 'user', select: 'name email avatar' },
    { path: 'car', select: 'name brand carModel images pricePerDay' },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

export const getAllBookings = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in. Please log in to access this resource.',
    });
  }
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = {};

  // If user is not admin, only show their own bookings
  if (userRole !== 'admin') {
    query.user = userId;
  }

  // Parse query parameters for filtering, sorting, and pagination
  const {
    status,
    carId,
    startDate,
    endDate,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = req.query;

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (carId) {
    query.car = carId;
  }

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const bookings = await Booking.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email avatar phone')
    .populate('car', 'name brand carModel images pricePerDay year');

  // Get total count for pagination
  const total = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
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

export const getBookingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find booking by ID with populated fields
  const booking = await Booking.findById(id)
    .populate('user', 'name email +role avatar')
    .populate(
      'car',
      'name brand carModel images pricePerDay year seats transmission',
    );

  // Check if booking exists
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization: users can only view their own bookings
  console.log(booking.user._id.toString(), userId.toString());
  if (
    userRole !== 'admin' &&
    booking.user._id.toString() !== userId.toString()
  ) {
    return next(
      new AppError('You do not have permission to view this booking', 403),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
      userRole,
    },
  });
});

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

export const updateBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const {
    startDate,
    endDate,
    pickupLocation,
    dropoffLocation,
    specialRequests,
    status,
    cancellationReason,
  } = req.body;

  // Find existing booking
  const booking = await Booking.findById(id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization
  if (userRole !== 'admin' && booking.user.toString() !== userId) {
    return next(
      new AppError('You do not have permission to update this booking', 403),
    );
  }

  // Check if booking can be updated based on status
  const notUpdatableStatuses = ['completed', 'cancelled', 'in_progress'];
  if (notUpdatableStatuses.includes(booking.status) && userRole !== 'admin') {
    return next(
      new AppError(`Cannot update booking with status: ${booking.status}`, 400),
    );
  }

  // Handle date updates
  let newStartDate = startDate ? new Date(startDate) : booking.startDate;
  let newEndDate = endDate ? new Date(endDate) : booking.endDate;

  if (startDate || endDate) {
    // Validate dates
    const now = new Date();
    if (newStartDate < now) {
      return next(new AppError('Start date cannot be in the past', 400));
    }

    if (newEndDate <= newStartDate) {
      return next(new AppError('End date must be after start date', 400));
    }

    // Recalculate total price if dates changed
    const car = await Car.findById(booking.car);
    if (car) {
      const days = Math.ceil(
        (newEndDate - newStartDate) / (1000 * 60 * 60 * 24),
      );
      req.body.totalPrice = days * car.pricePerDay;
    }
  }

  // Handle status updates (mainly for admins)
  if (status && userRole === 'admin') {
    req.body.status = status;

    // Add cancellation details if cancelling
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      req.body.cancelledAt = new Date();
      if (!cancellationReason && !req.body.cancellationReason) {
        return next(
          new AppError(
            'Cancellation reason is required when cancelling a booking',
            400,
          ),
        );
      }
      req.body.cancellationReason =
        cancellationReason || req.body.cancellationReason;
    }
  }

  // User can cancel their own booking
  if (
    status === 'cancelled' &&
    userRole !== 'admin' &&
    booking.user.toString() === userId
  ) {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

    // Check if cancellation is allowed (e.g., at least 24 hours before start)
    if (daysUntilStart < 1) {
      return next(
        new AppError(
          'Cannot cancel booking less than 24 hours before start date',
          400,
        ),
      );
    }

    req.body.status = 'cancelled';
    req.body.cancelledAt = new Date();
    if (!cancellationReason) {
      return next(new AppError('Cancellation reason is required', 400));
    }
    req.body.cancellationReason = cancellationReason;
  }

  // Prevent updating certain fields for non-admins
  if (userRole !== 'admin') {
    // Non-admins cannot change status directly except to cancel
    if (status && status !== 'cancelled') {
      delete req.body.status;
    }
  }

  // Update booking

  const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
    new: true, // Return updated document
    runValidators: true, // Run schema validators
    context: 'query', // For validation context
  })
    .populate('user', 'name email avatar')
    .populate('car', 'name brand carModel images pricePerDay');

  res.status(200).json({
    status: 'success',
    message: 'Booking updated successfully',
    data: {
      booking: updatedBooking,
    },
  });
});

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { cancellationReason } = req.body;
  console.log(
    `Cancelling booking ${id} by user ${userId} with role ${userRole}. Reason: ${cancellationReason}`,
  );

  // Find the booking
  const booking = await Booking.findById(id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization
  const isOwner = booking.user._id.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    return next(
      new AppError('You do not have permission to cancel this booking', 403),
    );
  }

  // Check if booking is already cancelled
  if (booking.status === 'cancelled') {
    return next(new AppError('This booking is already cancelled', 400));
  }

  // Check if booking can be cancelled based on status
  const cannotCancel = ['completed', 'in_progress'];
  if (cannotCancel.includes(booking.status)) {
    return next(new AppError(`Cannot cancel a ${booking.status} booking`, 400));
  }

  // Check cancellation deadline
  const now = new Date();
  const startDate = new Date(booking.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  const daysUntilStart = hoursUntilStart / 24;

  // Different rules for admin vs user
  if (!isAdmin) {
    const minHoursForCancel = 24; // Must cancel at least 24 hours before

    if (hoursUntilStart < minHoursForCancel) {
      return next(
        new AppError(
          `Bookings can only be cancelled at least ${minHoursForCancel} hours before start time. 
         You have ${Math.max(0, Math.floor(hoursUntilStart))} hours remaining.`,
          400,
        ),
      );
    }
  }

  // Require cancellation reason
  if (!cancellationReason || cancellationReason.trim().length < 5) {
    return next(
      new AppError(
        'Please provide a cancellation reason (minimum 5 characters)',
        400,
      ),
    );
  }

  // Calculate refund amount if applicable
  let refundAmount = 0;
  let refundPercentage = 0;

  if (!isAdmin) {
    // Different refund policies based on cancellation timing
    if (daysUntilStart >= 7) {
      refundPercentage = 100; // Full refund if cancelled 7+ days before
    } else if (daysUntilStart >= 3) {
      refundPercentage = 50; // 50% refund if cancelled 3-6 days before
    } else if (daysUntilStart >= 1) {
      refundPercentage = 25; // 25% refund if cancelled 1-2 days before
    } else {
      refundPercentage = 0; // No refund if cancelled less than 24 hours before
    }

    refundAmount = (booking.totalPrice * refundPercentage) / 100;
  } else {
    // Admin can give full refund
    refundPercentage = 100;
    refundAmount = booking.totalPrice;
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancelledAt = now;
  booking.cancellationReason = cancellationReason;

  await booking.save();

  // Populate for response
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
            ? `$${refundAmount} will be refunded to your original payment method within 5-7 business days`
            : 'No refund is available for this cancellation',
      },
    },
  });
});

export const checkCarAvailability = catchAsync(async (req, res, next) => {
  const { carId, startDate, endDate } = req.query;

  // Validate required parameters
  if (!startDate || !endDate) {
    return next(new AppError('Please provide start date and end date', 400));
  }

  // Parse and validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new AppError('Invalid date format', 400));
  }

  if (start < now) {
    return next(new AppError('Start date cannot be in the past', 400));
  }

  if (end <= start) {
    return next(new AppError('End date must be after start date', 400));
  }

  // Check maximum booking duration (e.g., 30 days)
  const maxDuration = 30;
  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (durationDays > maxDuration) {
    return next(
      new AppError(`Maximum booking duration is ${maxDuration} days`, 400),
    );
  }

  let query = {};

  // If specific car ID is provided
  if (carId) {
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return next(new AppError('Car not found', 404));
    }

    if (!car.isAvailable) {
      return res.status(200).json({
        status: 'success',
        data: {
          available: false,
          message: 'This car is not available for booking',
          car: {
            _id: car._id,
            name: car.name,
            brand: car.brand,
            model: car.model,
          },
        },
      });
    }

    query.car = carId;
  }

  // Find overlapping bookings
  const overlappingBookings = await Booking.find({
    ...(carId && { car: carId }),
    status: { $in: ['confirmed', 'in_progress'] },
    $or: [
      {
        startDate: { $lt: end },
        endDate: { $gt: start },
      },
    ],
  }).populate('car', 'name brand carModel images');

  const isAvailable = overlappingBookings.length === 0;

  res.status(200).json({
    status: 'success',
    data: {
      available: isAvailable,
      startDate: start,
      endDate: end,
      durationDays,
      ...(carId && {
        car:
          overlappingBookings[0]?.car ||
          (await Car.findById(carId).select(
            'name brand model pricePerDay images',
          )),
      }),
      ...(!isAvailable && {
        conflictingBookings: overlappingBookings.map((booking) => ({
          _id: booking._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
        })),
      }),
    },
  });
});

export const getAvailableTimeSlots = catchAsync(async (req, res, next) => {
  const { carId, date } = req.query;

  // Validate required parameters
  if (!carId || !date) {
    return next(new AppError('Please provide car ID and date', 400));
  }

  // Check if car exists
  const car = await Car.findById(carId);
  if (!car) {
    return next(new AppError('Car not found', 404));
  }

  // Parse date
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    return next(
      new AppError('Invalid date format. Use YYYY-MM-DD format', 400),
    );
  }

  // Set date range for the selected day
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Define available time slots (30-minute intervals)
  const allTimeSlots = [
    { time: '00:00', hour: 0, minute: 0 },
    { time: '00:30', hour: 0, minute: 30 },
    { time: '01:00', hour: 1, minute: 0 },
    { time: '01:30', hour: 1, minute: 30 },
    { time: '02:00', hour: 2, minute: 0 },
    { time: '02:30', hour: 2, minute: 30 },
    { time: '03:00', hour: 3, minute: 0 },
    { time: '03:30', hour: 3, minute: 30 },
    { time: '04:00', hour: 4, minute: 0 },
    { time: '04:30', hour: 4, minute: 30 },
    { time: '05:00', hour: 5, minute: 0 },
    { time: '05:30', hour: 5, minute: 30 },
    { time: '06:00', hour: 6, minute: 0 },
    { time: '06:30', hour: 6, minute: 30 },
    { time: '07:00', hour: 7, minute: 0 },
    { time: '07:30', hour: 7, minute: 30 },
    { time: '08:00', hour: 8, minute: 0 },
    { time: '08:30', hour: 8, minute: 30 },
    { time: '09:00', hour: 9, minute: 0 },
    { time: '09:30', hour: 9, minute: 30 },
    { time: '10:00', hour: 10, minute: 0 },
    { time: '10:30', hour: 10, minute: 30 },
    { time: '11:00', hour: 11, minute: 0 },
    { time: '11:30', hour: 11, minute: 30 },
    { time: '12:00', hour: 12, minute: 0 },
    { time: '12:30', hour: 12, minute: 30 },
    { time: '13:00', hour: 13, minute: 0 },
    { time: '13:30', hour: 13, minute: 30 },
    { time: '14:00', hour: 14, minute: 0 },
    { time: '14:30', hour: 14, minute: 30 },
    { time: '15:00', hour: 15, minute: 0 },
    { time: '15:30', hour: 15, minute: 30 },
    { time: '16:00', hour: 16, minute: 0 },
    { time: '16:30', hour: 16, minute: 30 },
    { time: '17:00', hour: 17, minute: 0 },
    { time: '17:30', hour: 17, minute: 30 },
    { time: '18:00', hour: 18, minute: 0 },
    { time: '18:30', hour: 18, minute: 30 },
    { time: '19:00', hour: 19, minute: 0 },
    { time: '19:30', hour: 19, minute: 30 },
    { time: '20:00', hour: 20, minute: 0 },
    { time: '20:30', hour: 20, minute: 30 },
    { time: '21:00', hour: 21, minute: 0 },
    { time: '21:30', hour: 21, minute: 30 },
    { time: '22:00', hour: 22, minute: 0 },
    { time: '22:30', hour: 22, minute: 30 },
    { time: '23:00', hour: 23, minute: 0 },
    { time: '23:30', hour: 23, minute: 30 },
  ];

  // Business hours (e.g., 9 AM to 9 PM)
  const businessHours = {
    start: 9, // 9 AM
    end: 21, // 9 PM
  };

  // Get existing bookings for the selected date
  const bookings = await Booking.find({
    car: carId,
    status: { $in: ['confirmed', 'in_progress', 'pending'] },
    $or: [
      {
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
      },
    ],
  });

  // Function to check if a time slot is available
  const isTimeSlotAvailable = (slotHour, slotMinute) => {
    // Check if within business hours
    if (slotHour < businessHours.start || slotHour >= businessHours.end) {
      return false;
    }

    const slotTime = new Date(selectedDate);
    slotTime.setHours(slotHour, slotMinute, 0, 0);
    const slotEndTime = new Date(slotTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30);

    // Check against existing bookings
    for (const booking of bookings) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check if time slot overlaps with booking
      if (slotTime < bookingEnd && slotEndTime > bookingStart) {
        return false;
      }
    }

    return true;
  };

  // Generate available time slots
  const availableSlots = allTimeSlots
    .filter((slot) => isTimeSlotAvailable(slot.hour, slot.minute))
    .map((slot) => ({
      time: slot.time,
      displayTime: formatTime(slot.hour, slot.minute),
      available: true,
    }));

  // Group slots into morning, afternoon, evening
  const morningSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 0 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 17 && hour < 24;
  });

  res.status(200).json({
    status: 'success',
    data: {
      car: {
        _id: car._id,
        name: car.name,
        brand: car.brand,
        model: car.model,
      },
      date: selectedDate,
      businessHours: {
        start: `${businessHours.start}:00`,
        end: `${businessHours.end}:00`,
      },
      availableSlots: availableSlots,
      slotsByPeriod: {
        morning: morningSlots,
        afternoon: afternoonSlots,
        evening: eveningSlots,
      },
      summary: {
        totalAvailableSlots: availableSlots.length,
        hasAvailability: availableSlots.length > 0,
        nextAvailableSlot: availableSlots[0]?.time || null,
      },
    },
  });
});

// Helper function to format time
function formatTime(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export const getUserBookingHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Core stats aggregation
  const stats = await Booking.aggregate([
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
  ]);

  // Upcoming bookings
  const now = new Date();
  const upcomingBookings = await Booking.find({
    user: userId,
    status: { $in: ['confirmed', 'pending'] },
    startDate: { $gt: now },
  })
    .sort('startDate')
    .limit(5)
    .populate('car', 'name brand carModel images pricePerDay year');

  // Recent bookings
  const recentBookings = await Booking.find({ user: userId })
    .sort('-createdAt')
    .limit(5)
    .populate('car', 'name brand carModel images pricePerDay year');

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

// Helper function to get suggested cars based on history
async function getSuggestedCars(userId, topCars) {
  // Get user's preferred brands from history
  const preferredBrands = topCars.map((car) => car.brand);

  // Find similar cars not booked yet
  const bookedCarIds = await Booking.find({ user: userId }).distinct('car');

  let suggestedCars = await Car.find({
    _id: { $nin: bookedCarIds },
    isAvailable: true,
    ...(preferredBrands.length > 0 && { brand: { $in: preferredBrands } }),
  })
    .limit(3)
    .select('name brand model pricePerDay images');

  if (suggestedCars.length === 0) {
    // Fallback to popular cars
    suggestedCars = await Car.find({ isAvailable: true })
      .limit(3)
      .select('name brand model pricePerDay images');
  }

  return suggestedCars;
}

export const getBookingStatistics = catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const {
    startDate,
    endDate,
    groupBy = 'day', // day, week, month, year
    includeDetails = false,
  } = req.query;

  // Date range filter
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Get date range for default (last 30 days if not specified)
  let defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const matchStage = {
    ...dateFilter,
    ...(!startDate && !endDate
      ? { createdAt: { $gte: defaultStartDate } }
      : {}),
  };

  // Main statistics aggregation
  const statistics = await Booking.aggregate([
    { $match: matchStage },
    {
      $facet: {
        // Overall metrics
        overall: [
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$totalPrice' },
              averageBookingValue: { $avg: '$totalPrice' },
              totalDays: {
                $sum: {
                  $divide: [
                    { $subtract: ['$endDate', '$startDate'] },
                    86400000,
                  ],
                },
              },
            },
          },
        ],

        // Status breakdown
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$totalPrice' },
            },
          },
        ],

        // Daily/Monthly trends
        trends: [
          {
            $group: {
              _id: getGroupByFormat(groupBy),
              period: { $first: getPeriodDate(groupBy) },
              bookings: { $sum: 1 },
              revenue: { $sum: '$totalPrice' },
              averagePrice: { $avg: '$totalPrice' },
            },
          },
          { $sort: { _id: 1 } },
        ],

        // Top cars by bookings
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
              carId: '$_id',
              name: '$carDetails.name',
              brand: '$carDetails.brand',
              model: '$carDetails.model',
              bookings: 1,
              revenue: 1,
            },
          },
        ],

        // Top users by bookings
        topUsers: [
          {
            $group: {
              _id: '$user',
              bookings: { $sum: 1 },
              totalSpent: { $sum: '$totalPrice' },
            },
          },
          { $sort: { bookings: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          { $unwind: '$userDetails' },
          {
            $project: {
              userId: '$_id',
              name: '$userDetails.name',
              email: '$userDetails.email',
              bookings: 1,
              totalSpent: 1,
            },
          },
        ],

        // Cancellation analysis
        cancellations: [
          { $match: { status: 'cancelled' } },
          {
            $group: {
              _id: null,
              totalCancellations: { $sum: 1 },
              totalRefundAmount: { $sum: '$totalPrice' },
              averageCancellationLeadTime: {
                $avg: {
                  $divide: [
                    { $subtract: ['$cancelledAt', '$createdAt'] },
                    3600000,
                  ],
                },
              },
            },
          },
        ],

        // Peak hours analysis (based on startDate)
        peakHours: [
          {
            $group: {
              _id: { $hour: '$startDate' },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { bookings: -1 } },
          { $limit: 5 },
        ],

        // Average lead time (days between booking and start)
        leadTime: [
          {
            $group: {
              _id: null,
              averageLeadTime: {
                $avg: {
                  $divide: [
                    { $subtract: ['$startDate', '$createdAt'] },
                    86400000,
                  ],
                },
              },
              minLeadTime: {
                $min: {
                  $divide: [
                    { $subtract: ['$startDate', '$createdAt'] },
                    86400000,
                  ],
                },
              },
              maxLeadTime: {
                $max: {
                  $divide: [
                    { $subtract: ['$startDate', '$createdAt'] },
                    86400000,
                  ],
                },
              },
            },
          },
        ],

        // Average booking duration
        avgDuration: [
          {
            $group: {
              _id: null,
              averageDurationDays: {
                $avg: {
                  $divide: [
                    { $subtract: ['$endDate', '$startDate'] },
                    86400000,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  // Get additional detailed statistics if requested
  let detailedStats = null;
  if (includeDetails === 'true') {
    detailedStats = await getDetailedStatistics(matchStage);
  }

  // Calculate growth percentages
  const previousPeriodStats = await getPreviousPeriodStats(
    matchStage,
    startDate,
    endDate,
  );

  const result = statistics[0];
  const overall = result.overall[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    totalDays: 0,
  };

  // Prepare response
  const response = {
    status: 'success',
    data: {
      period: {
        from: startDate || defaultStartDate,
        to: endDate || new Date(),
      },
      overview: {
        totalBookings: overall.totalBookings,
        totalRevenue: overall.totalRevenue,
        averageBookingValue:
          Math.round(overall.averageBookingValue * 100) / 100,
        totalBookingDays: Math.round(overall.totalDays),
        revenueGrowth: calculateGrowth(
          previousPeriodStats.totalRevenue,
          overall.totalRevenue,
        ),
        bookingsGrowth: calculateGrowth(
          previousPeriodStats.totalBookings,
          overall.totalBookings,
        ),
      },
      statusBreakdown: result.byStatus,
      trends: result.trends,
      topCars: result.topCars,
      topUsers: result.topUsers,
      cancellations: result.cancellations[0] || {
        totalCancellations: 0,
        totalRefundAmount: 0,
        averageCancellationLeadTime: 0,
      },
      peakHours: result.peakHours,
      leadTime: result.leadTime[0] || {
        averageLeadTime: 0,
        minLeadTime: 0,
        maxLeadTime: 0,
      },
      averageDuration: result.avgDuration[0] || { averageDurationDays: 0 },
      cancellationRate: calculatePercentage(
        result.cancellations[0]?.totalCancellations || 0,
        overall.totalBookings,
      ),
      completionRate: calculatePercentage(
        result.byStatus.find((s) => s._id === 'completed')?.count || 0,
        overall.totalBookings,
      ),
    },
  };

  if (detailedStats) {
    response.data.detailed = detailedStats;
  }

  res.status(200).json(response);
});

// Helper function to get group by format
function getGroupByFormat(groupBy) {
  switch (groupBy) {
    case 'week':
      return {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      };
    case 'month':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    case 'year':
      return { year: { $year: '$createdAt' } };
    default: // day
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
  }
}

// Helper function to get period date
function getPeriodDate(groupBy) {
  switch (groupBy) {
    case 'week':
      return { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
    case 'month':
      return { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    case 'year':
      return { $dateToString: { format: '%Y', date: '$createdAt' } };
    default:
      return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }
}

// Helper function to calculate growth percentage
function calculateGrowth(previous, current) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Helper function to calculate percentage
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Helper function to get previous period statistics
async function getPreviousPeriodStats(currentMatch, startDate, endDate) {
  if (!startDate || !endDate) {
    // Calculate previous 30 days
    const previousStart = new Date();
    previousStart.setDate(previousStart.getDate() - 60);
    const previousEnd = new Date();
    previousEnd.setDate(previousEnd.getDate() - 30);

    const previousStats = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousStart,
            $lte: previousEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    return previousStats[0] || { totalBookings: 0, totalRevenue: 0 };
  }

  // Calculate previous period of same length
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = end - start;
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - duration / 86400000);
  const previousEnd = new Date(start);

  const previousStats = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: previousStart,
          $lte: previousEnd,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  return previousStats[0] || { totalBookings: 0, totalRevenue: 0 };
}

// Helper function to get detailed statistics
async function getDetailedStatistics(matchStage) {
  const detailedStats = await Booking.aggregate([
    { $match: matchStage },
    {
      $facet: {
        // Revenue by car brand
        revenueByBrand: [
          {
            $lookup: {
              from: 'cars',
              localField: 'car',
              foreignField: '_id',
              as: 'carInfo',
            },
          },
          { $unwind: '$carInfo' },
          {
            $group: {
              _id: '$carInfo.brand',
              revenue: { $sum: '$totalPrice' },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
        ],

        // Repeat customers rate
        repeatCustomers: [
          {
            $group: {
              _id: '$user',
              bookingCount: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              totalCustomers: { $sum: 1 },
              repeatCustomers: {
                $sum: { $cond: [{ $gte: ['$bookingCount', 2] }, 1, 0] },
              },
              oneTimeCustomers: {
                $sum: { $cond: [{ $eq: ['$bookingCount', 1] }, 1, 0] },
              },
            },
          },
        ],

        // Day of week analysis
        dayOfWeek: [
          {
            $group: {
              _id: { $dayOfWeek: '$startDate' },
              bookings: { $sum: 1 },
              revenue: { $sum: '$totalPrice' },
            },
          },
          { $sort: { _id: 1 } },
        ],

        // Average price per day
        avgPricePerDay: [
          {
            $group: {
              _id: null,
              averagePricePerDay: {
                $avg: {
                  $divide: [
                    '$totalPrice',
                    {
                      $divide: [
                        { $subtract: ['$endDate', '$startDate'] },
                        86400000,
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const result = detailedStats[0];
  const repeatData = result.repeatCustomers[0] || {};

  return {
    revenueByBrand: result.revenueByBrand,
    repeatCustomersRate: calculatePercentage(
      repeatData.repeatCustomers || 0,
      repeatData.totalCustomers || 0,
    ),
    oneTimeCustomersRate: calculatePercentage(
      repeatData.oneTimeCustomers || 0,
      repeatData.totalCustomers || 0,
    ),
    dayOfWeek: result.dayOfWeek,
    averagePricePerDay: result.avgPricePerDay[0]?.averagePricePerDay || 0,
  };
}

export const updateBookingStatus = catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const { id } = req.params;
  const { status, adminNotes, sendNotification = true } = req.body;

  // Validate status
  const validStatuses = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ];
  if (!status || !validStatuses.includes(status)) {
    return next(
      new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400,
      ),
    );
  }

  // Find the booking
  const booking = await Booking.findById(id)
    .populate('user', 'name email phone')
    .populate('car', 'name brand carModel pricePerDay');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Store old status for comparison
  const oldStatus = booking.status;

  // Check if status change is valid
  if (oldStatus === 'completed' && status !== 'completed') {
    return next(
      new AppError('Cannot change status of a completed booking', 400),
    );
  }

  if (oldStatus === 'cancelled' && status !== 'cancelled') {
    return next(
      new AppError('Cannot change status of a cancelled booking', 400),
    );
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(status)) {
    return next(
      new AppError(
        `Invalid status transition from ${oldStatus} to ${status}`,
        400,
      ),
    );
  }

  // Update booking status
  booking.status = status;

  // Add additional data based on status
  if (status === 'cancelled' && !booking.cancelledAt) {
    booking.cancelledAt = new Date();
    if (!req.body.cancellationReason) {
      return next(
        new AppError(
          'Cancellation reason is required when cancelling a booking',
          400,
        ),
      );
    }
    booking.cancellationReason = req.body.cancellationReason;
  }

  if (status === 'completed') {
    booking.completedAt = new Date();
  }

  if (status === 'in_progress') {
    booking.startedAt = new Date();
  }

  if (status === 'confirmed') {
    booking.confirmedAt = new Date();
  }

  // Add admin notes if provided
  if (adminNotes) {
    booking.adminNotes = adminNotes;
  }

  await booking.save();

  // Send notification to user if requested
  if (sendNotification === true || sendNotification === 'true') {
    try {
      await sendStatusUpdateNotification(booking, oldStatus, status);
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't fail the request if notification fails
    }
  }

  // Log the status change
  await logStatusChange(
    booking._id,
    oldStatus,
    status,
    req.user.id,
    adminNotes,
  );

  // Populate for response
  await booking.populate([
    { path: 'user', select: 'name email avatar phone' },
    { path: 'car', select: 'name brand carModel images pricePerDay' },
  ]);

  res.status(200).json({
    status: 'success',
    message: `Booking status updated from ${oldStatus} to ${status}`,
    data: {
      booking: {
        _id: booking._id,
        status: booking.status,
        oldStatus,
        updatedAt: new Date(),
        user: booking.user,
        car: booking.car,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        ...(booking.cancelledAt && { cancelledAt: booking.cancelledAt }),
        ...(booking.cancellationReason && {
          cancellationReason: booking.cancellationReason,
        }),
        ...(booking.completedAt && { completedAt: booking.completedAt }),
        ...(booking.startedAt && { startedAt: booking.startedAt }),
        ...(booking.confirmedAt && { confirmedAt: booking.confirmedAt }),
      },
      notificationSent:
        sendNotification === true || sendNotification === 'true',
    },
  });
});
