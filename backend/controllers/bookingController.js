import Booking from '../models/Bookings.js';
import Ticket from '../models/Tickets.js'; // You'll need to import this

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Enhanced getBookingsByUser with more details
export const getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get bookings with all details
        const bookings = await Booking.findByUserIdWithDetails(userId);

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get detailed booking information
export const getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get booking with details
        const booking = await Booking.findByIdWithDetails(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get tickets for this booking
        const tickets = await Ticket.findByBookingId(id);

        res.status(200).json({
            success: true,
            data: {
                ...booking,
                tickets: tickets
            }
        });
    } catch (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user booking statistics
export const getUserBookingStats = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const stats = await Booking.getUserBookingStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching user booking stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel booking (update status)
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // To verify ownership
        
        // First check if booking exists and belongs to user
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.userID !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own bookings'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed booking'
            });
        }

        // Update booking status to cancelled
        const updatedBooking = await Booking.update(id, {
            ...booking,
            status: 'cancelled'
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createBooking = async (req, res) => {
    try {
        let bookingData;

        if (req.headers['content-type'] === 'text/plain') {
            try {
                bookingData = JSON.parse(req.body);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in text/plain body'
                });
            }
        } else {
            bookingData = req.body;
        }

        const { userID, passengerID, bookingDate, totalPrice, status } = bookingData;

        if (!userID || !passengerID || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userID, passengerID, and totalPrice'
            });
        }

        const newBooking = {
            userID,
            passengerID,
            bookingDate: bookingDate || new Date().toISOString().split('T')[0],
            totalPrice,
            status: status || 'pending'
        };

        const booking = await Booking.create(newBooking);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { userID, passengerID, bookingDate, totalPrice, status } = req.body;

        if (!userID || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userID and totalPrice'
            });
        }

        const updatedBooking = await Booking.update(id, {
            userID,
            passengerID,
            bookingDate,
            totalPrice,
            status
        });

        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Booking.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getBookingTickets = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get tickets for this booking
        const tickets = await Ticket.findByBookingId(id);

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};