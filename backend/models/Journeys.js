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
            // If no journeyID provided, generate one
            if (!journeyID) {
                journeyID = await this.generateJourneyID(scheduleID);
            }

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

    // New method to generate journey ID
    static async generateJourneyID(scheduleID) {
        try {
            // Get all journeys for this schedule
            const [rows] = await pool.query(
                'SELECT journeyID FROM journey WHERE scheduleID = ? ORDER BY journeyID DESC',
                [scheduleID]
            );

            // Find the highest auto-increment number for this schedule
            let maxAutoIncrement = 0;
            const schedulePart = scheduleID.toString().padStart(2, '0');

            for (const row of rows) {
                const journeyIdStr = row.journeyID.toString();
                if (journeyIdStr.startsWith(schedulePart) && journeyIdStr.length >= 4) {
                    const autoIncrementPart = parseInt(journeyIdStr.slice(-2)) || 0;
                    maxAutoIncrement = Math.max(maxAutoIncrement, autoIncrementPart);
                }
            }

            // Generate new journey ID
            const autoIncrementPart = (maxAutoIncrement + 1).toString().padStart(2, '0');
            return schedulePart + autoIncrementPart;
        } catch (error) {
            console.error('Error generating journey ID:', error);
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