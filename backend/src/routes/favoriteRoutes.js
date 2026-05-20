import express from 'express';
const router = express.Router();

import { protect } from '../controllers/authController.js';
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../controllers/favoriteController.js';

// All routes require authentication
router.get('/', protect, getFavorites);
router.post('/:carId', protect, addFavorite);
router.delete('/:carId', protect, removeFavorite);

export default router;
