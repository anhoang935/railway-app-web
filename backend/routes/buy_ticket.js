import express from 'express';
import { searchTrains, getCoachesByTrainName } from '../controllers/buyTicketController.js';

const router = express.Router();

router.get('/search', searchTrains);
router.get('/coaches', getCoachesByTrainName);
export default router;