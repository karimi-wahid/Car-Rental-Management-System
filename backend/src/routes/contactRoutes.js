import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createContact,
  getAllContacts,
  getContactById,
  replyToContact,
  updateContactStatus,
  markAsSpam,
  deleteContact,
} from '../controllers/contactController.js';

const router = express.Router();

// Public — anyone can submit
router.post('/', createContact);

// Admin only
router.use(protect, restrictTo('admin'));
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.patch('/:id/reply', replyToContact);
router.patch('/:id/status', updateContactStatus);
router.patch('/:id/spam', markAsSpam);
router.delete('/:id', deleteContact);

export default router;
