import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import stationRoutes from './routes/station.js';
import trainRoutes from './routes/train.js';
import coachTypeRoutes from './routes/coachType.js';
import bookingRoutes from './routes/booking.js';
import coachRoutes from './routes/coach.js';
import journeyRoutes from './routes/journey.js';
import passengerRoutes from './routes/passenger.js';
import scheduleRoutes from './routes/schedule.js';
import ticketRoutes from './routes/ticket.js';
import userRoutes from './routes/user.js';
import ticketRoutes from './routes/ticket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/trains', trainRoutes);
app.use('/api/v1/coach-types', coachTypeRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});