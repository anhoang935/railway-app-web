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
}

export default Booking;