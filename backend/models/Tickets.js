import pool from '../Config/db.js';

class Ticket {
  // Get all tickets with related information
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.*,
          p.fullname AS passengerName,
          tr.trainName,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType,
          b.status AS bookingStatus
        FROM ticket t
        LEFT JOIN passenger p ON t.passengerID = p.passengerID
        LEFT JOIN train tr ON t.trainID = tr.trainID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        LEFT JOIN booking b ON t.bookingID = b.bookingID
        ORDER BY t.departureDate DESC, t.departureTime DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get ticket by ID
  static async findById(ticketID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.*,
          p.fullname AS passengerName,
          p.phone_number AS passengerPhone,
          p.email AS passengerEmail,
          tr.trainName,
          tr.trainType,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType,
          coach_type.capacity AS coachCapacity,
          b.status AS bookingStatus,
          b.bookingDate
        FROM ticket t
        LEFT JOIN passenger p ON t.passengerID = p.passengerID
        LEFT JOIN train tr ON t.trainID = tr.trainID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        LEFT JOIN booking b ON t.bookingID = b.bookingID
        WHERE t.ticketID = ?
      `, [ticketID]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get tickets by passenger ID
  static async findByPassengerId(passengerID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.*,
          tr.trainName,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType,
          b.status AS bookingStatus
        FROM ticket t
        LEFT JOIN train tr ON t.trainID = tr.trainID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        LEFT JOIN booking b ON t.bookingID = b.bookingID
        WHERE t.passengerID = ?
        ORDER BY t.departureDate DESC, t.departureTime DESC
      `, [passengerID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get tickets by booking ID
  static async findByBookingId(bookingID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.*,
          p.fullname AS passengerName,
          tr.trainName,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType
        FROM ticket t
        LEFT JOIN passenger p ON t.passengerID = p.passengerID
        LEFT JOIN train tr ON t.trainID = tr.trainID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        WHERE t.bookingID = ?
        ORDER BY t.seatNumber
      `, [bookingID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get tickets by train ID
  static async findByTrainId(trainID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.*,
          p.fullname AS passengerName,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType,
          b.status AS bookingStatus
        FROM ticket t
        LEFT JOIN passenger p ON t.passengerID = p.passengerID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        LEFT JOIN booking b ON t.bookingID = b.bookingID
        WHERE t.trainID = ?
        ORDER BY t.departureDate DESC, t.departureTime DESC
      `, [trainID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new ticket
  static async create({ 
    bookingID, 
    passengerID, 
    trainID, 
    seatNumber, 
    departure_stationID, 
    arrival_stationID, 
    departureTime, 
    departureDate, 
    ticketPrice, 
    coachID 
  }) {
    try {
      // Validate booking exists
      const [bookingCheck] = await pool.query(
        'SELECT * FROM booking WHERE bookingID = ?',
        [bookingID]
      );
      
      if (bookingCheck.length === 0) {
        throw new Error(`Booking with ID ${bookingID} does not exist`);
      }

      // Validate passenger exists
      const [passengerCheck] = await pool.query(
        'SELECT * FROM passenger WHERE passengerID = ?',
        [passengerID]
      );
      
      if (passengerCheck.length === 0) {
        throw new Error(`Passenger with ID ${passengerID} does not exist`);
      }

      // Validate train exists
      const [trainCheck] = await pool.query(
        'SELECT * FROM train WHERE trainID = ?',
        [trainID]
      );
      
      if (trainCheck.length === 0) {
        throw new Error(`Train with ID ${trainID} does not exist`);
      }

      // Validate departure station exists
      const [depStationCheck] = await pool.query(
        'SELECT * FROM station WHERE stationID = ?',
        [departure_stationID]
      );
      
      if (depStationCheck.length === 0) {
        throw new Error(`Departure station with ID ${departure_stationID} does not exist`);
      }

      // Validate arrival station exists
      const [arrStationCheck] = await pool.query(
        'SELECT * FROM station WHERE stationID = ?',
        [arrival_stationID]
      );
      
      if (arrStationCheck.length === 0) {
        throw new Error(`Arrival station with ID ${arrival_stationID} does not exist`);
      }

      // Validate coach exists if provided
      if (coachID) {
        const [coachCheck] = await pool.query(
          'SELECT * FROM coach WHERE coachID = ?',
          [coachID]
        );
        
        if (coachCheck.length === 0) {
          throw new Error(`Coach with ID ${coachID} does not exist`);
        }
      }

      // Check if seat is already taken for the same train, date, and coach
      const [seatCheck] = await pool.query(
        'SELECT * FROM ticket WHERE trainID = ? AND departureDate = ? AND coachID = ? AND seatNumber = ?',
        [trainID, departureDate, coachID, seatNumber]
      );
      
      if (seatCheck.length > 0) {
        throw new Error(`Seat ${seatNumber} is already taken for this train and date`);
      }

      const [result] = await pool.query(
        `INSERT INTO ticket 
        (bookingID, passengerID, trainID, seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice, coachID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingID, passengerID, trainID, seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice, coachID]
      );

      return {
        ticketID: result.insertId,
        bookingID,
        passengerID,
        passengerName: passengerCheck[0].fullname,
        trainID,
        trainName: trainCheck[0].trainName,
        seatNumber,
        departure_stationID,
        departureStationName: depStationCheck[0].stationName,
        arrival_stationID,
        arrivalStationName: arrStationCheck[0].stationName,
        departureTime,
        departureDate,
        ticketPrice,
        coachID
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Update ticket
  static async update(ticketID, ticketData) {
    try {
      const { 
        seatNumber, 
        departure_stationID, 
        arrival_stationID, 
        departureTime, 
        departureDate, 
        ticketPrice, 
        coachID 
      } = ticketData;

      // Check if ticket exists
      const [ticketCheck] = await pool.query(
        'SELECT * FROM ticket WHERE ticketID = ?',
        [ticketID]
      );
      
      if (ticketCheck.length === 0) {
        return null;
      }

      // Validate stations if provided
      if (departure_stationID) {
        const [depStationCheck] = await pool.query(
          'SELECT * FROM station WHERE stationID = ?',
          [departure_stationID]
        );
        
        if (depStationCheck.length === 0) {
          throw new Error(`Departure station with ID ${departure_stationID} does not exist`);
        }
      }

      if (arrival_stationID) {
        const [arrStationCheck] = await pool.query(
          'SELECT * FROM station WHERE stationID = ?',
          [arrival_stationID]
        );
        
        if (arrStationCheck.length === 0) {
          throw new Error(`Arrival station with ID ${arrival_stationID} does not exist`);
        }
      }

      // Validate coach if provided
      if (coachID) {
        const [coachCheck] = await pool.query(
          'SELECT * FROM coach WHERE coachID = ?',
          [coachID]
        );
        
        if (coachCheck.length === 0) {
          throw new Error(`Coach with ID ${coachID} does not exist`);
        }
      }

      // Check seat availability if seat or date is being changed
      if (seatNumber || departureDate || coachID) {
        const currentTicket = ticketCheck[0];
        const newSeatNumber = seatNumber || currentTicket.seatNumber;
        const newDepartureDate = departureDate || currentTicket.departureDate;
        const newCoachID = coachID || currentTicket.coachID;

        const [seatCheck] = await pool.query(
          'SELECT * FROM ticket WHERE trainID = ? AND departureDate = ? AND coachID = ? AND seatNumber = ? AND ticketID != ?',
          [currentTicket.trainID, newDepartureDate, newCoachID, newSeatNumber, ticketID]
        );
        
        if (seatCheck.length > 0) {
          throw new Error(`Seat ${newSeatNumber} is already taken for this train and date`);
        }
      }

      const [result] = await pool.query(
        `UPDATE ticket SET 
        seatNumber = COALESCE(?, seatNumber),
        departure_stationID = COALESCE(?, departure_stationID),
        arrival_stationID = COALESCE(?, arrival_stationID),
        departureTime = COALESCE(?, departureTime),
        departureDate = COALESCE(?, departureDate),
        ticketPrice = COALESCE(?, ticketPrice),
        coachID = COALESCE(?, coachID)
        WHERE ticketID = ?`,
        [seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice, coachID, ticketID]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Get the updated ticket data
      const [updatedTicketRows] = await pool.query(`
        SELECT 
          t.*,
          p.fullname AS passengerName,
          tr.trainName,
          departure_station.stationName AS departureStationName,
          arrival_station.stationName AS arrivalStationName,
          coach_type.type AS coachType
        FROM ticket t
        LEFT JOIN passenger p ON t.passengerID = p.passengerID
        LEFT JOIN train tr ON t.trainID = tr.trainID
        LEFT JOIN station AS departure_station ON t.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station ON t.arrival_stationID = arrival_station.stationID
        LEFT JOIN coach c ON t.coachID = c.coachID
        LEFT JOIN coach_type ON c.coach_typeID = coach_type.coach_typeID
        WHERE t.ticketID = ?
      `, [ticketID]);

      return updatedTicketRows[0];
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  // Delete ticket
  static async delete(ticketID) {
    try {
      const [result] = await pool.query(
        'DELETE FROM ticket WHERE ticketID = ?',
        [ticketID]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get available seats for a specific train, date, and coach
  static async getAvailableSeats(trainID, departureDate, coachID) {
    try {
      // Get coach capacity
      const [coachInfo] = await pool.query(`
        SELECT c.*, ct.capacity 
        FROM coach c
        JOIN coach_type ct ON c.coach_typeID = ct.coach_typeID
        WHERE c.coachID = ?
      `, [coachID]);

      if (coachInfo.length === 0) {
        throw new Error(`Coach with ID ${coachID} does not exist`);
      }

      const capacity = coachInfo[0].capacity;

      // Get taken seats
      const [takenSeats] = await pool.query(
        'SELECT seatNumber FROM ticket WHERE trainID = ? AND departureDate = ? AND coachID = ?',
        [trainID, departureDate, coachID]
      );

      const takenSeatNumbers = takenSeats.map(seat => seat.seatNumber);
      const allSeats = Array.from({ length: capacity }, (_, i) => (i + 1).toString());
      const availableSeats = allSeats.filter(seat => !takenSeatNumbers.includes(seat));

      return {
        coachID,
        coachType: coachInfo[0].coach_typeID,
        capacity,
        availableSeats,
        takenSeats: takenSeatNumbers
      };
    } catch (error) {
      throw error;
    }
  }
}

export default Ticket;