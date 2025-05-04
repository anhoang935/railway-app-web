import express from 'express';
import {
  getAllStations,
  getStation,
  createStation,
  updateStation,
  deleteStation
} from '../controllers/stationController.js';

const router = express.Router();

// Public routes
router.get('/', getAllStations);
router.get('/:id', getStation);

// Admin routes (you can add authentication middleware later)
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

export default router;