import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createFeedback,
  getCarFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getAllFeedback,
  moderateFeedback,
  replyToFeedback,
} from '../controllers/feedbackController.js';

const router = express.Router();

// User routes
router.post('/', protect, createFeedback);
router.get('/my-reviews', protect, getMyFeedback);
router.get('/car/:carId', protect, getCarFeedback);
router.patch('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);

// Admin routes
router.get('/', protect, restrictTo('admin'), getAllFeedback);
router.patch('/:id/moderate', protect, restrictTo('admin'), moderateFeedback);
router.patch('/:id/reply', protect, restrictTo('admin'), replyToFeedback);

export default router;
