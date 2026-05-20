import { Car } from '../models/carModel.js';
import { Booking } from '../models/bookingModel.js';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiFetuares from '../utils/apiFeatures.js';
import mongoose from 'mongoose';

export const createCar = catchAsync(async (req, res, next) => {
  let {
    name,
    brand,
    carModel,
    year,
    seats,
    transmission,
    fuelType,
    pricePerDay,
    description,
    features,
    licensePlate,
    mileage,
    color,
    availability = true,
  } = req.body;

  // ✅ Validate required fields
  const requiredFields = [
    'name',
    'brand',
    'carModel',
    'year',
    'seats',
    'transmission',
    'fuelType',
    'pricePerDay',
    'description',
    'licensePlate',
  ];

  features = JSON.parse(features);

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400),
    );
  }

  // ✅ Validate ranges
  const currentYear = new Date().getFullYear();

  if (year < 2000 || year > currentYear + 1) {
    return next(
      new AppError(`Year must be between 2000 and ${currentYear + 1}`, 400),
    );
  }

  // ✅ Normalize license plate
  const normalizedLicensePlate = licensePlate.toUpperCase().trim();

  const existingCar = await Car.findOne({
    licensePlate: normalizedLicensePlate,
  });

  if (existingCar) {
    return next(
      new AppError(
        `Car with license plate ${normalizedLicensePlate} already exists`,
        400,
      ),
    );
  }

  // ✅ Upload images to Cloudinary

  // ❗ Require at least one image
  if (!req.files || req.files.length === 0) {
    return next(new AppError('At least one car image is required', 400));
  }

  const uploadResults = [];
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'cars',
    });
    uploadResults.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  const images = uploadResults;

  // ✅ Create car
  const newCar = await Car.create({
    name: name.trim(),
    brand: brand.trim(),
    carModel: carModel.trim(),
    year: year,
    seats: seats,
    transmission,
    fuelType,
    pricePerDay,
    images: images,
    description: description.trim(),
    features,
    licensePlate: normalizedLicensePlate,
    mileage,
    color: color ? color.trim() : '',
    availability: availability === true || availability === 'true',
    createdBy: req.user._id,
  });

  console.log(
    `Admin ${req.user.email} created car: ${newCar.name} (${newCar.licensePlate})`,
  );

  res.status(201).json({
    status: 'success',
    message: 'Car created successfully',
    data: {
      car: newCar,
    },
  });
});

export const getAllCars = catchAsync(async (req, res, next) => {
  const {
    // Pagination
    page = 1,
    limit = 10,
    sort = '-createdAt',

    // Basic filters
    brand,
    carModel,
    year,
    transmission,
    fuelType,
    seats,
    color,

    // Price range
    minPrice,
    maxPrice,

    // Availability
    availability = true,

    // Search
    search,

    // Date range for availability check
    startDate,
    endDate,

    // Other filters
    minYear,
    maxYear,
    minSeats,
    maxSeats,
    features,
  } = req.query;

  // Build query object
  let query = {};

  // Basic filters
  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
  }

  if (carModel) {
    query.carModel = { $regex: carModel, $options: 'i' };
  }

  if (year) {
    query.year = parseInt(year);
  }

  if (transmission) {
    const transmissions = transmission.split(',');
    query.transmission = { $in: transmissions };
  }

  if (fuelType) {
    const fuelTypes = fuelType.split(',');
    query.fuelType = { $in: fuelTypes };
  }

  if (seats) {
    query.seats = parseInt(seats);
  }

  if (color) {
    query.color = { $regex: color, $options: 'i' };
  }

  if (availability !== undefined) {
    query.availability = availability === 'true' || availability === true;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Year range filter
  if (minYear || maxYear) {
    query.year = {};
    if (minYear) query.year.$gte = parseInt(minYear);
    if (maxYear) query.year.$lte = parseInt(maxYear);
  }

  // Seats range filter
  if (minSeats || maxSeats) {
    query.seats = {};
    if (minSeats) query.seats.$gte = parseInt(minSeats);
    if (maxSeats) query.seats.$lte = parseInt(maxSeats);
  }

  // Features filter (array contains all specified features)
  if (features) {
    const featuresArray = features.split(',');
    query.features = { $all: featuresArray };
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Date availability filter (check if car is available for specific dates)
  if (startDate && endDate) {
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

    // Get booked car IDs for the date range
    const Booking = mongoose.model('Booking');
    const bookedCarIds = await Booking.distinct('car', {
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
      ],
    });

    // Exclude booked cars
    query._id = { $nin: bookedCarIds };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sortQuery = {};
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sortQuery[field.substring(1)] = -1;
      } else {
        sortQuery[field] = 1;
      }
    });
  }

  // Execute queries in parallel
  const [cars, total] = await Promise.all([
    Car.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email'),
    Car.countDocuments(query),
  ]);

  // Calculate price statistics for filtered results
  const priceStats = await Car.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$pricePerDay' },
        maxPrice: { $max: '$pricePerDay' },
        avgPrice: { $avg: '$pricePerDay' },
      },
    },
  ]);

  // Get unique filter options for UI (facets)
  const facets = await Car.aggregate([
    { $match: query },
    {
      $facet: {
        brands: [{ $group: { _id: '$brand' } }, { $sort: { _id: 1 } }],
        models: [{ $group: { _id: '$carModel' } }, { $sort: { _id: 1 } }],
        years: [{ $group: { _id: '$year' } }, { $sort: { _id: -1 } }],
        transmissions: [{ $group: { _id: '$transmission' } }],
        fuelTypes: [{ $group: { _id: '$fuelType' } }],
        seats: [{ $group: { _id: '$seats' } }, { $sort: { _id: 1 } }],
        colors: [{ $group: { _id: '$color' } }, { $sort: { _id: 1 } }],
      },
    },
  ]);

  // Prepare response
  const response = {
    status: 'success',
    results: cars.length,
    total,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
    filters: {
      applied: {
        brand: brand || null,
        model: carModel || null,
        year: year || null,
        transmission: transmission || null,
        fuelType: fuelType || null,
        seats: seats || null,
        priceRange: {
          min: minPrice ? parseFloat(minPrice) : null,
          max: maxPrice ? parseFloat(maxPrice) : null,
        },
        availability: availability === 'true' || availability === true,
        ...(startDate &&
          endDate && {
            dateRange: {
              start: startDate,
              end: endDate,
            },
          }),
      },
      available: facets[0],
      priceStats: priceStats[0] || null,
    },
    data: {
      cars: cars.map((car) => ({
        _id: car._id,
        name: car.name,
        brand: car.brand,
        carModel: car.carModel,
        year: car.year,
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuelType,
        pricePerDay: car.pricePerDay,
        images: car.images,
        description: car.description,
        features: car.features,
        availability: car.availability,
        licensePlate: car.licensePlate,
        mileage: car.mileage,
        color: car.color,
        createdAt: car.createdAt,
        createdBy: car.createdBy,
      })),
    },
  };

  res.status(200).json(response);
});

export const getCarById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find car by ID with populated fields
  const car = await Car.findById(id).populate('createdBy', 'name email').lean();

  // Check if car exists
  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  const [totalBookings, upcomingBookings, averageRating] = await Promise.all([
    Booking.countDocuments({ car: id, status: 'completed' }),
    Booking.countDocuments({
      car: id,
      status: { $in: ['confirmed', 'pending'] },
      startDate: { $gt: new Date() },
    }),
    Booking.aggregate([
      {
        $match: {
          car: new mongoose.Types.ObjectId(id),
          rating: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Get similar cars (same brand or similar price range)
  const similarCars = await Car.find({
    _id: { $ne: id },
    availability: true,
    $or: [
      { brand: car.brand },
      {
        pricePerDay: {
          $gte: car.pricePerDay * 0.8,
          $lte: car.pricePerDay * 1.2,
        },
      },
    ],
  })
    .limit(4)
    .select(
      'name brand carModel pricePerDay images year seats transmission fuelType',
    )
    .lean();

  // Get availability for next 30 days
  const availabilityCalendar = await getCarAvailabilityCalendar(id);

  res.status(200).json({
    status: 'success',
    data: {
      car: {
        ...car,
        statistics: {
          totalBookings,
          upcomingBookings,
          averageRating: averageRating[0]?.averageRating || 0,
          totalReviews: averageRating[0]?.totalReviews || 0,
        },
        availabilityCalendar,
        similarCars,
      },
    },
  });
});

// Helper function to get availability calendar
async function getCarAvailabilityCalendar(carId) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const bookings = await mongoose
    .model('Booking')
    .find({
      car: carId,
      status: { $in: ['confirmed', 'in_progress'] },
      startDate: { $lte: thirtyDaysFromNow },
      endDate: { $gte: new Date() },
    })
    .select('startDate endDate status');

  const calendar = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    // Check if date is booked
    const isBooked = bookings.some(
      (booking) =>
        currentDate >= booking.startDate && currentDate <= booking.endDate,
    );

    calendar.push({
      date: currentDate.toISOString().split('T')[0],
      available: !isBooked,
      dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
    });
  }

  return calendar;
}

export const updateCar = catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const { id } = req.params;
  const updateData = { ...req.body };

  // Find existing car
  const car = await Car.findById(id);
  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  // Validate and process license plate (if being updated)
  if (updateData.licensePlate) {
    updateData.licensePlate = updateData.licensePlate.toUpperCase().trim();

    // Check if license plate already exists on another car
    const existingCar = await Car.findOne({
      licensePlate: updateData.licensePlate,
      _id: { $ne: id },
    });

    if (existingCar) {
      return next(
        new AppError('Car with this license plate already exists', 400),
      );
    }
  }

  // Validate year if being updated
  if (updateData.year) {
    const currentYear = new Date().getFullYear();
    if (updateData.year < 2000 || updateData.year > currentYear + 1) {
      return next(
        new AppError(`Year must be between 2000 and ${currentYear + 1}`, 400),
      );
    }
  }

  // Validate seats if being updated
  if (updateData.seats) {
    if (updateData.seats < 2 || updateData.seats > 50) {
      return next(new AppError('Seats must be between 2 and 50', 400));
    }
  }

  // Validate price if being updated
  if (updateData.pricePerDay && updateData.pricePerDay < 0) {
    return next(new AppError('Price per day cannot be negative', 400));
  }

  // Validate transmission if being updated
  if (updateData.transmission) {
    const validTransmissions = ['manual', 'automatic', 'semi_automatic', 'cvt'];
    if (!validTransmissions.includes(updateData.transmission)) {
      return next(
        new AppError(
          `Invalid transmission. Must be one of: ${validTransmissions.join(', ')}`,
          400,
        ),
      );
    }
  }

  // Validate fuel type if being updated
  if (updateData.fuelType) {
    const validFuelTypes = [
      'petrol',
      'diesel',
      'electric',
      'hybrid',
      'plugin_hybrid',
    ];
    if (!validFuelTypes.includes(updateData.fuelType)) {
      return next(
        new AppError(
          `Invalid fuel type. Must be one of: ${validFuelTypes.join(', ')}`,
          400,
        ),
      );
    }
  }

  // Validate images if being updated
  if (updateData.images) {
    if (!Array.isArray(updateData.images) || updateData.images.length === 0) {
      return next(new AppError('At least one image is required', 400));
    }
  }

  // Validate mileage if being updated
  if (updateData.mileage && updateData.mileage < car.mileage) {
    return next(
      new AppError('Mileage cannot be less than previous mileage', 400),
    );
  }

  // Update the car
  const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
    new: true, // Return updated document
    runValidators: true, // Run schema validators
  }).populate('createdBy', 'name email');

  // Log the update action
  console.log(
    `Admin ${req.user.email} updated car: ${updatedCar.name} (${updatedCar.licensePlate})`,
  );

  res.status(200).json({
    status: 'success',
    message: 'Car updated successfully',
    data: {
      car: updatedCar,
    },
  });
});

export const deleteCar = catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const { id } = req.params;

  // Find the car
  const car = await Car.findById(id);
  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  // Check if car has any bookings
  const Booking = mongoose.model('Booking');
  const bookingCount = await Booking.countDocuments({ car: id });

  if (bookingCount > 0) {
    return next(
      new AppError(
        `Cannot delete car with ${bookingCount} existing bookings. Consider deactivating instead.`,
        400,
      ),
    );
  }

  // Delete the car
  await Car.findByIdAndDelete(id);

  // Log the deletion
  console.log(
    `Admin ${req.user.email} deleted car: ${car.name} (${car.licensePlate})`,
  );

  res.status(204).json({
    status: 'success',
    message: 'Car deleted successfully',
    data: null,
  });
});

export const toggleCarAvailability = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const { id } = req.params;

  const car = await Car.findById(id);
  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  const newAvailability = !car.availability;

  // ❗ Prevent deactivation if bookings exist
  if (!newAvailability && car.availability) {
    const Booking = mongoose.model('Booking');

    const activeBookings = await Booking.findOne({
      car: id,
      status: { $in: ['confirmed', 'pending', 'in_progress'] },
      startDate: { $gt: new Date() },
    });

    if (activeBookings) {
      return next(
        new AppError('Cannot deactivate car with active future bookings.', 400),
      );
    }
  }

  car.availability = newAvailability;
  await car.save();

  console.log(
    `Admin ${req.user.email} ${
      newAvailability ? 'activated' : 'deactivated'
    } car: ${car.name}`,
  );

  res.status(200).json({
    status: 'success',
    message: `Car ${
      newAvailability ? 'activated' : 'deactivated'
    } successfully`,
    data: {
      car: {
        _id: car._id,
        availability: car.availability,
      },
    },
  });
});

export const getCarStatistics = catchAsync(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  const {
    startDate,
    endDate,
    groupBy = 'car',
    includeDetails = false,
  } = req.query;

  // Date range filter
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const Booking = mongoose.model('Booking');

  // Get all cars with their booking statistics
  const carStats = await Car.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'car',
        as: 'allBookings',
      },
    },
    {
      $addFields: {
        totalBookings: { $size: '$allBookings' },
        completedBookings: {
          $size: {
            $filter: {
              input: '$allBookings',
              as: 'booking',
              cond: { $eq: ['$$booking.status', 'completed'] },
            },
          },
        },
        cancelledBookings: {
          $size: {
            $filter: {
              input: '$allBookings',
              as: 'booking',
              cond: { $eq: ['$$booking.status', 'cancelled'] },
            },
          },
        },
        activeBookings: {
          $size: {
            $filter: {
              input: '$allBookings',
              as: 'booking',
              cond: {
                $in: [
                  '$$booking.status',
                  ['confirmed', 'pending', 'in_progress'],
                ],
              },
            },
          },
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$allBookings.status', 'completed'] },
              '$allBookings.totalPrice',
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        carModel: 1,
        year: 1,
        pricePerDay: 1,
        availability: 1,
        totalBookings: 1,
        completedBookings: 1,
        cancelledBookings: 1,
        activeBookings: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: { totalBookings: -1 },
    },
  ]);

  // Calculate overall statistics
  const overallStats = {
    totalCars: carStats.length,
    availableCars: carStats.filter((car) => car.availability).length,
    unavailableCars: carStats.filter((car) => !car.availability).length,
    totalBookings: carStats.reduce((sum, car) => sum + car.totalBookings, 0),
    totalRevenue: carStats.reduce((sum, car) => sum + car.totalRevenue, 0),
    averageBookingsPerCar:
      carStats.length > 0
        ? (
            carStats.reduce((sum, car) => sum + car.totalBookings, 0) /
            carStats.length
          ).toFixed(2)
        : 0,
    averageRevenuePerCar:
      carStats.length > 0
        ? (
            carStats.reduce((sum, car) => sum + car.totalRevenue, 0) /
            carStats.length
          ).toFixed(2)
        : 0,
  };

  // Get top performing cars
  const topCars = {
    byBookings: [...carStats]
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 5),
    byRevenue: [...carStats]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5),
    byUtilization: [...carStats]
      .sort(
        (a, b) =>
          b.completedBookings / (b.totalBookings || 1) -
          a.completedBookings / (a.totalBookings || 1),
      )
      .slice(0, 5),
  };

  // Get brand statistics
  const brandStats = carStats.reduce((acc, car) => {
    if (!acc[car.brand]) {
      acc[car.brand] = {
        brand: car.brand,
        count: 0,
        totalBookings: 0,
        totalRevenue: 0,
        availableCars: 0,
      };
    }
    acc[car.brand].count++;
    acc[car.brand].totalBookings += car.totalBookings;
    acc[car.brand].totalRevenue += car.totalRevenue;
    if (car.availability) acc[car.brand].availableCars++;
    return acc;
  }, {});

  const brandStatsArray = Object.values(brandStats);

  // Get statistics by year
  const yearStats = carStats.reduce((acc, car) => {
    const year = car.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        count: 0,
        totalBookings: 0,
        totalRevenue: 0,
      };
    }
    acc[year].count++;
    acc[year].totalBookings += car.totalBookings;
    acc[year].totalRevenue += car.totalRevenue;
    return acc;
  }, {});

  const yearStatsArray = Object.values(yearStats).sort(
    (a, b) => b.year - a.year,
  );

  // Get detailed statistics if requested
  let detailedStats = null;
  if (includeDetails === 'true') {
    detailedStats = await getDetailedCarStats(dateFilter);
  }

  res.status(200).json({
    status: 'success',
    data: {
      overall: overallStats,
      topCars,
      brandBreakdown: brandStatsArray,
      yearBreakdown: yearStatsArray,
      allCars: carStats,
      ...(detailedStats && { detailed: detailedStats }),
    },
  });
});

// Helper function to get detailed car statistics
async function getDetailedCarStats(dateFilter) {
  const Booking = mongoose.model('Booking');

  const detailedStats = await Booking.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$car',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
        averagePrice: { $avg: '$totalPrice' },
        totalDays: {
          $sum: {
            $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
          },
        },
      },
    },
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
        carName: '$carDetails.name',
        brand: '$carDetails.brand',
        model: '$carDetails.carModel',
        pricePerDay: '$carDetails.pricePerDay',
        bookings: 1,
        revenue: 1,
        averagePrice: 1,
        totalDays: 1,
        utilizationRate: {
          $multiply: [
            { $divide: ['$totalDays', { $multiply: ['$bookings', 30] }] },
            100,
          ],
        },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return detailedStats;
}

export const getUniqueBrands = catchAsync(async (req, res, next) => {
  // Get unique brands from cars
  const brands = await Car.aggregate([
    {
      $match: { availability: true }, // Only show brands from available cars
    },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
        cars: { $push: { name: '$name', model: '$carModel', year: '$year' } },
      },
    },
    {
      $project: {
        _id: 0,
        brand: '$_id',
        count: 1,
        models: { $size: '$cars' },
        // Optional: include sample of cars for each brand
        sampleCars: { $slice: ['$cars', 3] },
      },
    },
    {
      $sort: { brand: 1 },
    },
  ]);

  // Get total count of unique brands
  const totalBrands = brands.length;

  // Get brand popularity (most booked brands)
  const Booking = mongoose.model('Booking');
  const popularBrands = await Booking.aggregate([
    {
      $match: { status: 'completed' },
    },
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
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    {
      $sort: { bookings: -1 },
    },
    { $limit: 10 },
    {
      $project: {
        brand: '$_id',
        bookings: 1,
        revenue: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: totalBrands,
    data: {
      brands: brands.map((b) => b.brand),
      brandsWithDetails: brands,
      popularBrands,
      metadata: {
        totalBrands,
        hasBrands: totalBrands > 0,
      },
    },
  });
});
