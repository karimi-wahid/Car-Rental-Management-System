import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkCarAvailability,
  getAvailableTimeSlots,
  getUserBookingHistory,
  getBookingStatistics,
  updateBookingStatus,
  getMyBookings,
} from '../controllers/bookingController.js';

const router = express.Router();

// Public routes (authenticated users)
router.get('/check-availability', protect, checkCarAvailability);
router.get('/time-slots', protect, getAvailableTimeSlots);
router.get('/my-bookings', protect, getMyBookings);
router.get('/my-bookings-history', protect, getUserBookingHistory);
router.post('/', protect, createBooking);
router.get('/:id', protect, getBookingById);
router.patch('/:id', protect, updateBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin only routes
router.get('/', protect, restrictTo('admin'), getAllBookings);
router.get('/statistics', protect, restrictTo('admin'), getBookingStatistics);
router.patch('/:id/status', protect, restrictTo('admin'), updateBookingStatus);

export default router;
