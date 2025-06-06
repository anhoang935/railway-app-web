import express from 'express';
import { searchTrains, getCoachesByTrainName, getSeatBooked } from '../controllers/buyTicketController.js';

const router = express.Router();

router.get('/search', searchTrains);
router.get('/coaches', getCoachesByTrainName);
router.get('/booked-seat', getSeatBooked);
export default router;