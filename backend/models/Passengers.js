import pool from '../Config/db.js';

class Passenger {
  // Get all passengers
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM passenger');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger by ID
  static async findById(passengerID) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM passenger WHERE passengerID = ?',
        [passengerID]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new passenger
  static async create({ fullname, phone_number, email, status }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO passenger (fullname, phone_number, email, status) VALUES (?, ?, ?, ?)',
        [fullname, phone_number, email, status]
      );

      return {
        passengerID: result.insertId,
        fullname,
        phone_number,
        email,
        status
      };
    } catch (error) {
      console.error('Error inserting passenger:', error);
      throw error;
    }
  }

  // Update passenger
  static async update(passengerID, passengerData) {
    try {
      const { fullname, phone_number, email, status } = passengerData;
      const [result] = await pool.query(
        'UPDATE passenger SET fullname = ?, phone_number = ?, email = ?, status = ? WHERE passengerID = ?',
        [fullname, phone_number, email, status, passengerID]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return { passengerID, fullname, phone_number, email, status };
    } catch (error) {
      throw error;
    }
  }

  // Delete passenger
  static async delete(passengerID) {
    try {
      const [result] = await pool.query(
        'DELETE FROM passenger WHERE passengerID = ?',
        [passengerID]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger bookings
  static async getBookings(passengerID) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM booking WHERE passengerID = ?',
        [passengerID]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger tickets with updated joins
  static async getTickets(passengerID) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          ticket.ticketID,
          train.trainName,
          departure_station.stationName AS departureStation,
          arrival_station.stationName AS arrivalStation,
          ticket.departureTime,
          ticket.departureDate,
          -- CONCAT(ticket.coachID, '-', ticket.seatNumber) AS seatNumber,
          -- ticket.coachID AS seatNumber,
          seatNumber,
          ticket.ticketPrice,
          -- coach_type.type AS coachType,
          CONCAT(ticket.coachID, ' - ', coach_type.type) AS coachType,
          ticket.coachID
        FROM ticket
        LEFT JOIN train ON ticket.trainID = train.trainID
        LEFT JOIN station AS departure_station ON ticket.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON ticket.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach ON ticket.coachID = coach.coachID
        LEFT JOIN coach_type ON coach.coach_typeID = coach_type.coach_typeID
        WHERE ticket.passengerID = ?`,
        [passengerID]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Passenger;