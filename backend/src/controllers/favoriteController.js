import User from './../models/userModel.js';
import { Car } from './../models/carModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Get user's favorite cars (populated)
export const getFavorites = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('favorites');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.favorites.length,
    data: {
      favorites: user.favorites,
    },
  });
});

// Add a car to favorites (using $addToSet to avoid duplicates)
export const addFavorite = catchAsync(async (req, res, next) => {
  const { carId } = req.params;

  // Check if car exists before adding to favorites
  const car = await Car.findById(carId);
  if (!car) {
    return next(new AppError('Car not found', 404));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { favorites: carId } },
    { new: true, runValidators: true },
  ).populate('favorites');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Car added to favorites',
    data: {
      favorites: user.favorites,
    },
  });
});

// Remove a car from favorites
export const removeFavorite = catchAsync(async (req, res, next) => {
  const { carId } = req.params;
  console.log(carId);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { favorites: carId } },
    { new: true, runValidators: true },
  ).populate('favorites');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Car removed from favorites',
    data: {
      favorites: user.favorites,
    },
  });
});
