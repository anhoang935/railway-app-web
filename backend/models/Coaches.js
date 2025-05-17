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

    static async create({ coachID, trainID, coach_typeID }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO coach (coachID, trainID, coach_typeID) VALUES (?, ?, ?)',
                [coachID, trainID, coach_typeID]
            );

            return {
                coachID,
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
            const { trainID, coach_typeID } = coachData;
            const [result] = await pool.query(
                'UPDATE coach SET trainID = ?, coach_typeID = ? WHERE coachID = ?',
                [trainID, coach_typeID, coachID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return { coachID, trainID, coach_typeID };
        } catch (error) {
            console.error('Error updating coach:', error);
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