import express from 'express';
import {
    getAllTickets,
    getFilteredTickets,
    createTicket,
    deleteTicket
} from '../controllers/ticketController.js';

const router = express.Router()

// Public routes
router.get('/',getFilteredTickets);
router.post('/',createTicket);
router.delete('/:id', deleteTicket);

// Admin routes
router.get('/all', getAllTickets);

export default router;