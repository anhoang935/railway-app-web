import pool from '../Config/db.js';

class Track {
    // Get all tracks
    static async findAll() {
        try {
            const [rows] = await pool.query(`
        SELECT t.*, 
          s1.stationName AS station1Name, 
          s2.stationName AS station2Name 
        FROM track t
        JOIN station s1 ON t.station1ID = s1.stationID
        JOIN station s2 ON t.station2ID = s2.stationID
        ORDER BY t.trackID
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get track by ID
    static async findById(trackID) {
        try {
            const [rows] = await pool.query(`
        SELECT t.*, 
          s1.stationName AS station1Name, 
          s2.stationName AS station2Name 
        FROM track t
        JOIN station s1 ON t.station1ID = s1.stationID
        JOIN station s2 ON t.station2ID = s2.stationID
        WHERE t.trackID = ?
      `, [trackID]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Get tracks by station ID (either as station1 or station2)
    static async findByStationId(stationID) {
        try {
            const [rows] = await pool.query(`
        SELECT t.*, 
          s1.stationName AS station1Name, 
          s2.stationName AS station2Name 
        FROM track t
        JOIN station s1 ON t.station1ID = s1.stationID
        JOIN station s2 ON t.station2ID = s2.stationID
        WHERE t.station1ID = ? OR t.station2ID = ?
      `, [stationID, stationID]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Find track between two stations
    static async findBetweenStations(station1ID, station2ID) {
        try {
            const [rows] = await pool.query(`
        SELECT * FROM track 
        WHERE (station1ID = ? AND station2ID = ?)
        OR (station1ID = ? AND station2ID = ?)
      `, [station1ID, station2ID, station2ID, station1ID]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Create new track
    static async create({ station1ID, station2ID, distance }) {
        try {
            // Convert to strings for consistent comparison
            const station1Str = station1ID.toString();
            const station2Str = station2ID.toString();

            // Add validation for same station1 and station2
            if (station1Str === station2Str) {
                throw new Error('Station1 and station2 cannot be the same');
            }

            // Check if the stations exist
            const [station1Check] = await pool.query(
                'SELECT * FROM station WHERE stationID = ?',
                [station1ID]
            );

            if (station1Check.length === 0) {
                throw new Error(`Station with ID ${station1ID} does not exist`);
            }

            const [station2Check] = await pool.query(
                'SELECT * FROM station WHERE stationID = ?',
                [station2ID]
            );

            if (station2Check.length === 0) {
                throw new Error(`Station with ID ${station2ID} does not exist`);
            }

            // Check if track already exists
            const [existingTrack] = await pool.query(
                `SELECT * FROM track 
         WHERE (station1ID = ? AND station2ID = ?) 
         OR (station1ID = ? AND station2ID = ?)`,
                [station1ID, station2ID, station2ID, station1ID]
            );

            if (existingTrack.length > 0) {
                throw new Error('A track between these stations already exists');
            }

            const [result] = await pool.query(
                'INSERT INTO track (station1ID, station2ID, distance) VALUES (?, ?, ?)',
                [station1ID, station2ID, distance]
            );

            return {
                trackID: result.insertId,
                station1ID,
                station2ID,
                distance
            };
        } catch (error) {
            console.error('Error creating track:', error);
            throw error;
        }
    }

    // Update track
    static async update(trackID, trackData) {
        try {
            const { station1ID, station2ID, distance } = trackData;

            // Check if track exists
            const [trackCheck] = await pool.query(
                'SELECT * FROM track WHERE trackID = ?',
                [trackID]
            );

            if (trackCheck.length === 0) {
                return null;
            }

            // Get current values for comparison
            const currentTrack = trackCheck[0];

            // Use provided values or fall back to existing ones
            const finalStation1ID = station1ID || currentTrack.station1ID;
            const finalStation2ID = station2ID || currentTrack.station2ID;

            // Check if station1 and station2 are the same
            if (finalStation1ID === finalStation2ID) {
                throw new Error('Station1 and station2 cannot be the same');
            }

            // Check if the stations exist
            if (station1ID) {
                const [station1Check] = await pool.query(
                    'SELECT * FROM station WHERE stationID = ?',
                    [station1ID]
                );

                if (station1Check.length === 0) {
                    throw new Error(`Station with ID ${station1ID} does not exist`);
                }
            }

            if (station2ID) {
                const [station2Check] = await pool.query(
                    'SELECT * FROM station WHERE stationID = ?',
                    [station2ID]
                );

                if (station2Check.length === 0) {
                    throw new Error(`Station with ID ${station2ID} does not exist`);
                }
            }

            // Check if new configuration creates a duplicate
            if (station1ID || station2ID) {
                const [existingTrack] = await pool.query(
                    `SELECT * FROM track 
           WHERE trackID != ? AND 
           ((station1ID = ? AND station2ID = ?) 
           OR (station1ID = ? AND station2ID = ?))`,
                    [trackID, finalStation1ID, finalStation2ID, finalStation2ID, finalStation1ID]
                );

                if (existingTrack.length > 0) {
                    throw new Error('A track between these stations already exists');
                }
            }

            const [result] = await pool.query(
                'UPDATE track SET station1ID = ?, station2ID = ?, distance = ? WHERE trackID = ?',
                [
                    finalStation1ID,
                    finalStation2ID,
                    distance !== undefined ? distance : currentTrack.distance,
                    trackID
                ]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            // Get the updated track data with station names
            const [updatedTrackRows] = await pool.query(`
        SELECT t.*, 
          s1.stationName AS station1Name, 
          s2.stationName AS station2Name 
        FROM track t
        JOIN station s1 ON t.station1ID = s1.stationID
        JOIN station s2 ON t.station2ID = s2.stationID
        WHERE t.trackID = ?
      `, [trackID]);

            return updatedTrackRows[0];
        } catch (error) {
            throw error;
        }
    }

    // Delete track
    static async delete(trackID) {
        try {
            const [result] = await pool.query(
                'DELETE FROM track WHERE trackID = ?',
                [trackID]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

export default Track;