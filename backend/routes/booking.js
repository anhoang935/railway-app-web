import express from 'express';
import {
    getAllBookings,
    getBooking,
    getBookingsByUser,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingTickets  // Add this import
} from '../controllers/bookingController.js';

const router = express.Router();

// Public routes
router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.get('/user/:userId', getBookingsByUser);
router.get('/:id/tickets', getBookingTickets);  // Add this route

// Admin routes
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;