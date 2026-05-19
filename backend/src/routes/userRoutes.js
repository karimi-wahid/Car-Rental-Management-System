import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateAvatar,
  updateMe,
  updateUser,
  updateUserRole,
} from '../controllers/userController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);
router.patch(
  '/update-avatar',
  protect,
  restrictTo('user'),
  upload.single('avatar'),
  updateAvatar,
);

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(protect, getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

router.patch('/:id/role', protect, restrictTo('admin'), updateUserRole);

export default router;
