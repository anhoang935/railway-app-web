import pool from '../config/db.js';

class Timetable {
  // Get all stations
  static async getAllStations() {
    try {
      const [rows] = await pool.query('SELECT * FROM station ORDER BY stationID');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all tracks (for distance calculation)
  static async getAllTracks() {
    try {
      const [rows] = await pool.query('SELECT * FROM track');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all coach types
  static async getAllCoachTypes() {
    try {
      const [rows] = await pool.query('SELECT * FROM coach_type');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get coaches for a specific train
  static async getTrainCoaches(trainID) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, ct.type, ct.price, ct.capacity 
        FROM coach c
        JOIN coach_type ct ON c.coach_typeID = ct.coach_typeID
        WHERE c.trainID = ?
      `, [trainID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Search trains between two stations
  static async searchTrains(departureStationName, arrivalStationName, departureDate) {
    try {
      // Find trains that have schedules between the specified stations
      const query = `
        SELECT 
          t.trainID,
          t.trainName,
          (SUM(ct.capacity) - COUNT(tk.ticketID)) AS availableCapacity,
          s_dep.scheduleID,
          s_dep.departureTime,
          s_arr.arrivalTime,
          start_station.stationName AS departureStation,
          end_station.stationName AS arrivalStation
        FROM train t
        JOIN schedule s ON t.trainID = s.trainID
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN journey AS s_dep ON s.scheduleID = s_dep.scheduleID
        JOIN journey AS s_arr ON s.scheduleID = s_arr.scheduleID
        JOIN station AS dep_station ON s_dep.stationID = dep_station.stationID
        JOIN station AS arr_station ON s_arr.stationID = arr_station.stationID
        JOIN coach c ON t.trainID = c.trainID
        JOIN coach_type ct ON c.coach_typeID = ct.coach_typeID
        LEFT JOIN ticket tk ON 
          c.coachID = tk.coachID AND 
          tk.departure_stationID = dep_station.stationID AND 
          tk.arrival_stationID = arr_station.stationID AND
          DATE(tk.departureDate) = ?
        WHERE 
          dep_station.stationName = ? AND 
          arr_station.stationName = ? AND
          s_dep.journeyID < s_arr.journeyID AND
          s.scheduleStatus = 'on-time'
        GROUP BY 
          t.trainID,
          t.trainName, 
          s_dep.scheduleID,
          s_dep.departureTime, 
          s_arr.arrivalTime,
          start_station.stationName,
          end_station.stationName
        ORDER BY s_dep.departureTime ASC
      `;

      const [results] = await pool.query(query, [departureDate, departureStationName, arrivalStationName]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Get journey details for a specific schedule
  static async getJourneysBySchedule(scheduleID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          j.*,
          s.stationName,
          s.stationID
        FROM journey j
        JOIN station s ON j.stationID = s.stationID
        WHERE j.scheduleID = ?
        ORDER BY j.arrivalTime
      `, [scheduleID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get schedule details by ID
  static async getScheduleById(scheduleID) {
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

  // Get schedules between two stations
  static async getSchedulesBetweenStations(fromStationID, toStationID) {
    try {
      const [schedules] = await pool.query(`
        SELECT s.*,
          start_station.stationName AS start_stationName,
          end_station.stationName AS end_stationName,
          t.trainName,
          t.trainID
        FROM schedule s
        JOIN station AS start_station ON s.start_stationID = start_station.stationID
        JOIN station AS end_station ON s.end_stationID = end_station.stationID
        JOIN train t ON s.trainID = t.trainID
        JOIN journey j_start ON s.scheduleID = j_start.scheduleID AND j_start.stationID = ?
        JOIN journey j_end ON s.scheduleID = j_end.scheduleID AND j_end.stationID = ?
        WHERE s.scheduleStatus = 'on-time'
        ORDER BY s.departureTime
      `, [fromStationID, toStationID]);
      return schedules;
    } catch (error) {
      throw error;
    }
  }
}

export default Timetable;