import pool from '../Config/db.js';

class Booking {
    static async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM booking');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(bookingID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM booking WHERE bookingID = ?',
                [bookingID]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM booking WHERE userID = ?',
                [userID]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create({ userID, passengerID, bookingDate, totalPrice, status }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO booking (userID, passengerID, bookingDate, totalPrice, status) VALUES (?, ?, ?, ?, ?)',
                [userID, passengerID, bookingDate, totalPrice, status]
            );

            return {
                bookingID: result.insertId,
                userID,
                passengerID,
                bookingDate,
                totalPrice,
                status
            };
        } catch (error) {
            console.error('Error inserting booking:', error);
            throw error;
        }
    }

    static async update(bookingID, bookingData) {
        try {
            const { userID, passengerID, bookingDate, totalPrice, status } = bookingData;

            const [result] = await pool.query(
                'UPDATE booking SET userID = ?, passengerID = ?, bookingDate = ?, totalPrice = ?, status = ? WHERE bookingID = ?',
                [userID, passengerID, bookingDate, totalPrice, status, bookingID]
            );

            if (result.affectedRows === 0) {
                return null; // No booking was found with this ID
            }

            return {
                bookingID,
                userID,
                passengerID,
                bookingDate,
                totalPrice,
                status
            };
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    static async delete(bookingID) {
        try {
            const [result] = await pool.query(
                'DELETE FROM booking WHERE bookingID = ?',
                [bookingID]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Enhanced method for user bookings with passenger details
    static async findByUserIdWithDetails(userID) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    b.*,
                    p.fullname AS passengerName,
                    p.phone_number AS passengerPhone,
                    p.email AS passengerEmail,
                    u.UserName,
                    u.email AS userEmail
                FROM booking b
                LEFT JOIN passenger p ON b.passengerID = p.passengerID
                LEFT JOIN user u ON b.userID = u.userID
                WHERE b.userID = ?
                ORDER BY b.bookingDate DESC
            `, [userID]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get booking with all related details
    static async findByIdWithDetails(bookingID) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    b.*,
                    p.fullname AS passengerName,
                    p.phone_number AS passengerPhone,
                    p.email AS passengerEmail,
                    u.UserName,
                    u.email AS userEmail
                FROM booking b
                LEFT JOIN passenger p ON b.passengerID = p.passengerID
                LEFT JOIN user u ON b.userID = u.userID
                WHERE b.bookingID = ?
            `, [bookingID]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Get booking statistics for user
    static async getUserBookingStats(userID) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    COUNT(*) as totalBookings,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedBookings,
                    SUM(totalPrice) as totalSpent
                FROM booking 
                WHERE userID = ?
            `, [userID]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
}

export default Booking;