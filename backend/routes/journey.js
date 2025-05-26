import express from 'express';
import {
    getAllJourneys,
    getJourney,
    getJourneysByTrain,
    createJourney,
    updateJourney,
    deleteJourney
} from '../controllers/journeyController.js';

const router = express.Router();

// Public routes
router.get('/', getAllJourneys);
router.get('/:id', getJourney);
router.get('/train/:trainId', getJourneysByTrain);

// Admin routes
router.post('/', createJourney);
router.put('/:id', updateJourney);
router.delete('/:id', deleteJourney);

export default router;