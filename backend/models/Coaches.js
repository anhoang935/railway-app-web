import pool from '../Config/db.js';

class Coach {
    static async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM coach');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(coachID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM coach WHERE coachID = ?',
                [coachID]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByTrainId(trainID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM coach WHERE trainID = ?',
                [trainID]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create({ trainID, coach_typeID }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO coach (trainID, coach_typeID) VALUES (?, ?)',
                [trainID, coach_typeID]
            );

            return {
                coachID: result.insertId,
                trainID,
                coach_typeID
            };
        } catch (error) {
            console.error('Error inserting coach:', error);
            throw error;
        }
    }

    static async update(coachID, coachData) {
        try {
            const { trainID, coach_typeID, coachNumber, seatCapacity } = coachData;
            const [result] = await pool.query(
                'UPDATE coach SET trainID = ?, coach_typeID = ?, coachNumber = ?, seatCapacity = ? WHERE coachID = ?',
                [trainID, coach_typeID, coachNumber, seatCapacity, coachID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return { coachID, trainID, coach_typeID, coachNumber, seatCapacity };
        } catch (error) {
            throw error;
        }
    }

    static async delete(coachID) {
        try {
            const [result] = await pool.query(
                'DELETE FROM coach WHERE coachID = ?',
                [coachID]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

export default Coach;