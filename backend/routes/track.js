import express from 'express';
import {
    getAllTracks,
    getTrack,
    createTrack,
    updateTrack,
    deleteTrack,
    getTracksByStation,
    getTrackBetweenStations
} from '../controllers/trackController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTracks);
router.get('/:id', getTrack);
router.get('/station/:stationId', getTracksByStation);
router.get('/between/:startId/:endId', getTrackBetweenStations);

// Admin routes
router.post('/', createTrack);
router.put('/:id', updateTrack);
router.delete('/:id', deleteTrack);

export default router;