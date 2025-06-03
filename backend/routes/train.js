import express from 'express';
import {
  getAllTrains,
  getTrain,
  createTrain,
  updateTrain,
  deleteTrain
} from '../controllers/trainController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTrains);
router.get('/:id', getTrain);

// Admin routes
router.post('/', createTrain);
router.put('/:id', updateTrain);
router.delete('/:id', deleteTrain);

export default router;