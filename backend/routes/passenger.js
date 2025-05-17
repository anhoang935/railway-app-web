import express from 'express';
import {
  getAllPassengers,
  getPassenger,
  createPassenger,
  updatePassenger,
  deletePassenger,
  getPassengerBookings,
  getPassengerTickets
} from '../controllers/passengerController.js';

const router = express.Router();

// Public routes
router.get('/', getAllPassengers);
router.get('/:id', getPassenger);
router.get('/:id/bookings', getPassengerBookings);
router.get('/:id/tickets', getPassengerTickets);

// Admin/Protected routes (you can add authentication middleware later)
router.post('/', createPassenger);
router.put('/:id', updatePassenger);
router.delete('/:id', deletePassenger);

export default router;