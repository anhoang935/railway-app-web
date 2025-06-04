import pool from '../Config/db.js';

class Schedule {
  // Get all schedules
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        ORDER BY s.scheduleID ASC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get schedule by ID
  static async findById(scheduleID) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName, t.trainType
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        WHERE s.scheduleID = ?
      `, [scheduleID]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get schedules by train ID
  static async findByTrainId(trainID) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        WHERE s.trainID = ?
        ORDER BY s.scheduleID ASC
      `, [trainID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get schedules by station ID (either starting or ending at this station)
  static async findByStationId(stationID) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        WHERE s.start_stationID = ? OR s.end_stationID = ?
        ORDER BY s.scheduleID ASC
      `, [stationID, stationID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get schedules between two stations
  static async findBetweenStations(startStationID, endStationID) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        WHERE s.start_stationID = ? AND s.end_stationID = ?
        ORDER BY s.scheduleID ASC
      `, [startStationID, endStationID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new schedule
  static async create({ start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID }) {
    try {
      // Convert to strings for consistent comparison
      const startStationStr = start_stationID.toString();
      const endStationStr = end_stationID.toString();

      // Add validation for same start and end stations
      if (startStationStr === endStationStr) {
        throw new Error('Start station and end station cannot be the same');
      }

      // Validate the start_stationID exists
      const [startStationCheck] = await pool.query(
        'SELECT * FROM station WHERE stationID = ?',
        [start_stationID]
      );

      if (startStationCheck.length === 0) {
        throw new Error(`Start station with ID ${start_stationID} does not exist`);
      }

      // Validate the end_stationID exists
      const [endStationCheck] = await pool.query(
        'SELECT * FROM station WHERE stationID = ?',
        [end_stationID]
      );

      if (endStationCheck.length === 0) {
        throw new Error(`End station with ID ${end_stationID} does not exist`);
      }

      // Validate the trainID exists
      const [trainCheck] = await pool.query(
        'SELECT * FROM train WHERE trainID = ?',
        [trainID]
      );

      if (trainCheck.length === 0) {
        throw new Error(`Train with ID ${trainID} does not exist`);
      }

      const [result] = await pool.query(
        'INSERT INTO schedule (start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID) VALUES (?, ?, ?, ?, ?, ?)',
        [start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID]
      );

      return {
        scheduleID: result.insertId,
        start_stationID,
        start_stationName: startStationCheck[0].stationName,
        end_stationID,
        end_stationName: endStationCheck[0].stationName,
        departureTime,
        arrivalTime,
        scheduleStatus,
        trainID,
        trainName: trainCheck[0].trainName
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Update schedule
  static async update(scheduleID, scheduleData) {
    try {
      const { start_stationID, end_stationID, departureTime, arrivalTime, scheduleStatus, trainID } = scheduleData;

      // Check if schedule exists
      const [scheduleCheck] = await pool.query(
        'SELECT * FROM schedule WHERE scheduleID = ?',
        [scheduleID]
      );

      if (scheduleCheck.length === 0) {
        return null;
      }

      // Get current values for comparison
      const currentSchedule = scheduleCheck[0];
      const finalStartStationID = (start_stationID || currentSchedule.start_stationID).toString();
      const finalEndStationID = (end_stationID || currentSchedule.end_stationID).toString();

      // Add validation for same start and end stations
      if (finalStartStationID === finalEndStationID) {
        throw new Error('Start station and end station cannot be the same');
      }

      // Validate the start_stationID exists if provided
      if (start_stationID) {
        const [startStationCheck] = await pool.query(
          'SELECT * FROM station WHERE stationID = ?',
          [start_stationID]
        );

        if (startStationCheck.length === 0) {
          throw new Error(`Start station with ID ${start_stationID} does not exist`);
        }
      }

      // Validate the end_stationID exists if provided
      if (end_stationID) {
        const [endStationCheck] = await pool.query(
          'SELECT * FROM station WHERE stationID = ?',
          [end_stationID]
        );

        if (endStationCheck.length === 0) {
          throw new Error(`End station with ID ${end_stationID} does not exist`);
        }
      }

      // Validate the trainID exists if provided
      if (trainID) {
        const [trainCheck] = await pool.query(
          'SELECT * FROM train WHERE trainID = ?',
          [trainID]
        );

        if (trainCheck.length === 0) {
          throw new Error(`Train with ID ${trainID} does not exist`);
        }
      }

      const [result] = await pool.query(
        'UPDATE schedule SET start_stationID = ?, end_stationID = ?, departureTime = ?, arrivalTime = ?, scheduleStatus = ?, trainID = ? WHERE scheduleID = ?',
        [
          start_stationID || currentSchedule.start_stationID,
          end_stationID || currentSchedule.end_stationID,
          departureTime || currentSchedule.departureTime,
          arrivalTime || currentSchedule.arrivalTime,
          scheduleStatus || currentSchedule.scheduleStatus,
          trainID || currentSchedule.trainID,
          scheduleID
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Get the updated schedule data
      const [updatedScheduleRows] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        WHERE s.scheduleID = ?
      `, [scheduleID]);

      return updatedScheduleRows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete schedule
  static async delete(scheduleID) {
    try {
      // Check if there are any journeys associated with this schedule
      const [journeyCheck] = await pool.query(
        'SELECT * FROM journey WHERE scheduleID = ?',
        [scheduleID]
      );

      if (journeyCheck.length > 0) {
        throw new Error(`Cannot delete schedule with ID ${scheduleID} as it has associated journeys`);
      }

      const [result] = await pool.query(
        'DELETE FROM schedule WHERE scheduleID = ?',
        [scheduleID]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

export default Schedule;