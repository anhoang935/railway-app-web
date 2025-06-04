import express from 'express';
import {
    getAllBookings,
    getBooking,
    getBookingsByUser,
    getBookingDetails,
    getUserBookingStats,
    cancelBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingTickets
} from '../controllers/bookingController.js';

const router = express.Router();

// Public routes
router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.get('/:id/details', getBookingDetails);  // New: Get booking with full details
router.get('/:id/tickets', getBookingTickets);
router.get('/user/:userId', getBookingsByUser);
router.get('/user/:userId/stats', getUserBookingStats);  // New: Get user booking statistics

// User operations
router.patch('/:id/cancel', cancelBooking);  // New: Cancel booking

// Admin routes
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;