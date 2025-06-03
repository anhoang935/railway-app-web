import express from 'express';
import {
  getAllCoachTypes,
  getCoachType,
  createCoachType,
  updateCoachType,
  deleteCoachType
} from '../controllers/coachTypeController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCoachTypes);
router.get('/:id', getCoachType);

// Admin routes
router.post('/', createCoachType);
router.put('/:id', updateCoachType);
router.delete('/:id', deleteCoachType);

export default router;