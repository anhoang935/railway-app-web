import express from 'express';
import { searchTrains } from '../controllers/buyTicketController.js';

const router = express.Router();

router.get('/search', searchTrains);

export default router;