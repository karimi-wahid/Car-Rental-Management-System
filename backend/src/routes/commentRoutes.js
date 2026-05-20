import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getCarComments,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  getMyComments,
  getAllComments,
  moderateComment,
  adminDeleteComment,
  replyToComment,
} from '../controllers/commentController.js';

const router = express.Router();

// Public
router.get('/car/:carId', getCarComments);
router.get('/:commentId/replies', getCommentReplies);

// Authenticated users
router.use(protect);
router.post('/', createComment);
router.get('/my-comments', getMyComments);
router.patch('/:id', updateComment);
router.delete('/:id', deleteComment);
router.patch('/:id/like', toggleLike);

// Admin
router.use(restrictTo('admin'));
router.get('/', getAllComments);
router.patch('/:id/moderate', moderateComment);
router.patch('/:id/reply', replyToComment);
router.delete('/:id/admin', adminDeleteComment);

export default router;
