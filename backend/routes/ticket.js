import express from 'express';
import {
  getAllTickets,
  getTicket,
  getTicketsByPassenger,
  getTicketsByBooking,
  getTicketsByTrain,
  getAvailableSeats,
  createTicket,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTickets);
router.get('/:id', getTicket);
router.get('/passenger/:passengerId', getTicketsByPassenger);
router.get('/booking/:bookingId', getTicketsByBooking);
router.get('/train/:trainId', getTicketsByTrain);
router.get('/seats/:trainId/:date/:coachId', getAvailableSeats);

// Admin routes
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;