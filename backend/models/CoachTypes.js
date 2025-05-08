import pool from '../Config/db.js';

class CoachType {
  // Get all coach types
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM coach_type');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get coach type by ID
  static async findById(typeId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM coach_type WHERE coach_typeID = ?',
        [typeId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new coach type
  static async create({ coach_typeID, type, price, capacity }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO coach_type (coach_typeID, type, price, capacity) VALUES (?, ?, ?, ?)',
        [coach_typeID, type, price, capacity]
      );
  
      return {
        coach_typeID,
        type,
        price,
        capacity
      };
    } catch (error) {
      console.error('Error inserting coach type:', error);
      throw error;
    }
  }

  // Update coach type
  static async update(typeId, coachTypeData) {
    try {
      const { type, price, capacity } = coachTypeData;
      const [result] = await pool.query(
        'UPDATE coach_type SET type = ?, price = ?, capacity = ? WHERE coach_typeID = ?',
        [type, price, capacity, typeId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { coach_typeID: typeId, type, price, capacity };
    } catch (error) {
      throw error;
    }
  }

  // Delete coach type
  static async delete(typeId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM coach_type WHERE coach_typeID = ?',
        [typeId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

export default CoachType;