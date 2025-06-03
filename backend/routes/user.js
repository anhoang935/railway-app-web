import express from 'express';
import {
  getAllUsers,
  getUser,
  getUserByEmail,
  getUsersByStatus,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
  getUserBookings,
  verifyUserEmail,
  updateUserPassword
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/status/:status', getUsersByStatus);
router.get('/email/:email', getUserByEmail);
router.get('/:id', getUser);
router.get('/:id/bookings', getUserBookings);

// Authentication/verification routes
router.post('/:id/verify-email', verifyUserEmail);
router.put('/:id/password', updateUserPassword);

// Admin routes
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;