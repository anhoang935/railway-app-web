import express from 'express';
import {
  getAllStations,
  getAllTracks,
  getAllCoachTypes,
  getTrainCoaches,
  searchTrains,
  getJourneysBySchedule,
  getScheduleById,
  getSchedulesBetweenStations
} from '../controllers/timetableController.js';

const router = express.Router();

// Public routes - these don't require authentication
router.get('/stations', getAllStations);
router.get('/tracks', getAllTracks);
router.get('/coach-types', getAllCoachTypes);
router.get('/search', searchTrains);
router.get('/schedules/:id', getScheduleById);
router.get('/schedules/route/:fromStationId/:toStationId', getSchedulesBetweenStations);
router.get('/coaches/train/:trainId', getTrainCoaches);
router.get('/journeys/schedule/:scheduleId', getJourneysBySchedule);

export default router;