import pool from '../Config/db.js';

class Journey {
    static async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM journey');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(journeyID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM journey WHERE journeyID = ?',
                [journeyID]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByTrainId(trainID) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM journey WHERE trainID = ?',
                [trainID]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create({ journeyID, scheduleID, stationID, arrivalTime, departureTime, trainID }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO journey (journeyID, scheduleID, stationID, arrivalTime, departureTime, trainID) VALUES (?, ?, ?, ?, ?, ?)',
                [journeyID, scheduleID, stationID, arrivalTime, departureTime, trainID]
            );

            return {
                journeyID,
                scheduleID,
                stationID,
                arrivalTime,
                departureTime,
                trainID
            };
        } catch (error) {
            console.error('Error inserting journey:', error);
            throw error;
        }
    }

    static async update(journeyID, journeyData) {
        try {
            const { scheduleID, stationID, arrivalTime, departureTime, trainID } = journeyData;

            const [result] = await pool.query(
                'UPDATE journey SET scheduleID = ?, stationID = ?, arrivalTime = ?, departureTime = ?, trainID = ? WHERE journeyID = ?',
                [scheduleID, stationID, arrivalTime, departureTime, trainID, journeyID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return {
                journeyID,
                scheduleID,
                stationID,
                arrivalTime,
                departureTime,
                trainID
            };
        } catch (error) {
            console.error('Error updating journey:', error);
            throw error;
        }
    }

    static async delete(journeyID) {
        try {
            const [result] = await pool.query(
                'DELETE FROM journey WHERE journeyID = ?',
                [journeyID]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

export default Journey;