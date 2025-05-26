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
                `SELECT journey.* FROM journey 
                 JOIN schedule ON journey.scheduleID = schedule.scheduleID 
                 WHERE schedule.trainID = ?`,
                [trainID]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create({ journeyID, scheduleID, stationID, arrivalTime, departureTime }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO journey (journeyID, scheduleID, stationID, arrivalTime, departureTime) VALUES (?, ?, ?, ?, ?)',
                [journeyID, scheduleID, stationID, arrivalTime, departureTime]
            );

            return {
                journeyID,
                scheduleID,
                stationID,
                arrivalTime,
                departureTime
            };
        } catch (error) {
            console.error('Error inserting journey:', error);
            throw error;
        }
    }

    static async update(journeyID, journeyData) {
        try {
            const { scheduleID, stationID, arrivalTime, departureTime } = journeyData;

            const [result] = await pool.query(
                'UPDATE journey SET scheduleID = ?, stationID = ?, arrivalTime = ?, departureTime = ? WHERE journeyID = ?',
                [scheduleID, stationID, arrivalTime, departureTime, journeyID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return {
                journeyID,
                scheduleID,
                stationID,
                arrivalTime,
                departureTime
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