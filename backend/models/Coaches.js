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

    // NEW: Update train's coach count based on actual coaches
    static async updateTrainCoachCount(trainID) {
        try {
            // Count actual coaches for this train
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as coachCount FROM coach WHERE trainID = ?',
                [trainID]
            );

            const actualCoachCount = countResult[0].coachCount;

            // Update the train table with the actual count
            await pool.query(
                'UPDATE train SET coachTotal = ? WHERE trainID = ?',
                [actualCoachCount, trainID]
            );

            return actualCoachCount;
        } catch (error) {
            console.error('Error updating train coach count:', error);
            throw error;
        }
    }

    // Modify the create method to skip auto-updates by default
    static async create({ coachID, trainID, coach_typeID }, updateCount = false) {
        try {
            const [result] = await pool.query(
                'INSERT INTO coach (coachID, trainID, coach_typeID) VALUES (?, ?, ?)',
                [coachID, trainID, coach_typeID]
            );

            // Only update count when explicitly requested
            if (updateCount) {
                await this.updateTrainCoachCount(trainID);
            }

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

    // Add a background job queue or make updates asynchronous
    static async createCoachAsync({ coachID, trainID, coach_typeID }) {
        try {
            // Insert coach first
            const [result] = await pool.query(
                'INSERT INTO coach (coachID, trainID, coach_typeID) VALUES (?, ?, ?)',
                [coachID, trainID, coach_typeID]
            );

            // Update count in background (don't wait for it)
            setImmediate(() => {
                this.updateTrainCoachCount(trainID).catch(err =>
                    console.error('Background coach count update failed:', err)
                );
            });

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

    static async update(coachID, coachData, updateCount = false) {
        try {
            const { trainID, coach_typeID } = coachData;

            const [result] = await pool.query(
                'UPDATE coach SET trainID = ?, coach_typeID = ? WHERE coachID = ?',
                [trainID, coach_typeID, coachID]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            // Only update count when explicitly requested
            if (updateCount) {
                await this.updateTrainCoachCount(trainID);
            }

            return { coachID, trainID, coach_typeID };
        } catch (error) {
            console.error('Error updating coach:', error);
            throw error;
        }
    }

    static async delete(coachID) {
        try {
            // Get the coach's trainID before deletion
            const coach = await this.findById(coachID);
            const trainID = coach ? coach.trainID : null;

            const [result] = await pool.query(
                'DELETE FROM coach WHERE coachID = ?',
                [coachID]
            );

            // Update the train's coach count after deletion
            if (trainID) {
                await this.updateTrainCoachCount(trainID);
            }

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // NEW: Sync all trains' coach counts - useful for data maintenance
    static async syncAllTrainCoachCounts() {
        try {
            // Use a single UPDATE query instead of individual updates
            await pool.query(`
                UPDATE train t 
                SET coachTotal = (
                    SELECT COUNT(*) 
                    FROM coach c 
                    WHERE c.trainID = t.trainID
                )
            `);

            return true;
        } catch (error) {
            console.error('Error syncing all train coach counts:', error);
            throw error;
        }
    }
}

export default Coach;