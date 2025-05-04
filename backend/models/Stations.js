import pool from '../Config/db.js';

class Station {
  // Get all stations
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM station');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get station by ID
  static async findById(stationID) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM station WHERE stationID = ?',
        [stationID]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new station
  static async create({ stationName }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO station (stationName) VALUES (?)',
        [stationName]
      );

      return {
        stationID: result.insertId,
        stationName
      };
    } catch (error) {
      console.error('Error inserting station:', error);
      throw error;
    }
  }



  // Update station
  static async update(stationID, stationData) {
    try {
      const { stationName } = stationData;
      const [result] = await pool.query(
        'UPDATE station SET stationName = ? WHERE stationID = ?',
        [stationName, stationID]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { stationID, stationName };
    } catch (error) {
      throw error;
    }
  }

  // Delete station
  static async delete(stationID) {
    try {
      const [result] = await pool.query(
        'DELETE FROM station WHERE stationID = ?',
        [stationID]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

export default Station;