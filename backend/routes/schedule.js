import express from 'express';
import {
  getAllSchedules,
  getSchedule,
  getSchedulesByTrain,
  getSchedulesByStation,
  getSchedulesBetweenStations,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController.js';

const router = express.Router();

// Public routes
router.get('/', getAllSchedules);
router.get('/:id', getSchedule);
router.get('/train/:trainId', getSchedulesByTrain);
router.get('/station/:stationId', getSchedulesByStation);
router.get('/route/:startId/:endId', getSchedulesBetweenStations);

// Admin routes
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;