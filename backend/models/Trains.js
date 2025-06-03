import pool from '../Config/db.js';

class Trains {
  // Get all trains
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM train');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get train by ID
  static async findById(trainID) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM train WHERE trainID = ?',
        [trainID]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new train
  static async create({trainName, trainType, coachTotal }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO train (trainName, trainType, coachTotal) VALUES (?, ?, ?)',
        [trainName, trainType, coachTotal]
      );
  
      return {
        trainID: result.insertId, // Auto-incremented ID
        trainName,
        trainType,
        coachTotal
      };
    } catch (error) {
      console.error('Error inserting train:', error);
      throw error;
    }
  }

  // Update train
  static async update(trainID, trainData) {
    try {
      const { trainName, trainType, coachTotal } = trainData;
      const [result] = await pool.query(
        'UPDATE train SET trainName = ?, trainType = ?, coachTotal = ? WHERE trainID = ?',
        [trainName, trainType, coachTotal, trainID]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { trainID, trainName, trainType, coachTotal };
    } catch (error) {
      throw error;
    }
  }

  // Delete train
  static async delete(trainID) {
    try {
      const [result] = await pool.query(
        'DELETE FROM train WHERE trainID = ?',
        [trainID]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

export default Trains;