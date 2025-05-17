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

    static async create({ trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance }) {
        try {
            const [result] = await pool.query(
                'INSERT INTO journey (trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance]
            );

            return {
                journeyID: result.insertId,
                trainID,
                departureStationID,
                arrivalStationID,
                departureTime,
                arrivalTime,
                journeyDate,
                distance
            };
        } catch (error) {
            console.error('Error inserting journey:', error);
            throw error;
        }
    }

    static async update(journeyID, journeyData) {
        try {
            const { trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance } = journeyData;
            const [result] = await pool.query(
                'UPDATE journey SET trainID = ?, departureStationID = ?, arrivalStationID = ?, departureTime = ?, arrivalTime = ?, journeyDate = ?, distance = ? WHERE journeyID = ?',
                [trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance, journeyID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return { journeyID, trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance };
        } catch (error) {
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