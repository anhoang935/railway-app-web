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
import authRoutes from './routes/auth.js';
import buyTicket from './routes/buy_ticket.js';
import trackRoutes from './routes/track.js';
import timetableRoutes from './routes/timetable.js';
import './utils/ticketExpireService.js';

// Load environment variables FIRST
dotenv.config();

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not found in environment variables. Using fallback.');
} else {
  console.log('JWT_SECRET loaded successfully');
}

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/coaches', coachRoutes);
app.use('/api/v1/journeys', journeyRoutes);
app.use('/api/v1/passengers', passengerRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buy-ticket', buyTicket);
app.use('/api/v1/tracks', trackRoutes);
app.use('/api/timetable', timetableRoutes);

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