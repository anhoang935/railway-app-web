import express from 'express';
import {
    getAllCoaches,
    getCoach,
    getCoachesByTrain,
    createCoach,
    updateCoach,
    deleteCoach
} from '../controllers/coachController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCoaches);
router.get('/:id', getCoach);
router.get('/train/:trainId', getCoachesByTrain);

// Admin routes
router.post('/', createCoach);
router.put('/:id', updateCoach);
router.delete('/:id', deleteCoach);

export default router;