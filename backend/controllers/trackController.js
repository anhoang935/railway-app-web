import Track from '../models/Tracks.js';

// Get all tracks
export const getAllTracks = async (req, res) => {
    try {
        const tracks = await Track.findAll();

        res.status(200).json({
            success: true,
            count: tracks.length,
            data: tracks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single track
export const getTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const track = await Track.findById(id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: 'Track not found'
            });
        }

        res.status(200).json({
            success: true,
            data: track
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create a new track
export const createTrack = async (req, res) => {
    try {
        let trackData;

        // If content type is text/plain, try to parse it as JSON
        if (req.headers['content-type'] === 'text/plain') {
            try {
                trackData = JSON.parse(req.body);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in text/plain body'
                });
            }
        } else {
            trackData = req.body;
        }

        const { station1ID, station2ID, distance } = trackData;

        // Validate required fields
        if (!station1ID || !station2ID || distance === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide station1ID, station2ID, and distance'
            });
        }

        // Convert to number and validate
        const distanceNum = Number(distance);
        if (isNaN(distanceNum) || distanceNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Distance must be a positive number'
            });
        }

        const track = await Track.create({
            station1ID,
            station2ID,
            distance: distanceNum
        });

        res.status(201).json({
            success: true,
            message: 'Track created successfully',
            data: track
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a track
export const updateTrack = async (req, res) => {
    try {
        const { id } = req.params;

        let trackData;
        if (req.headers['content-type'] === 'text/plain') {
            try {
                trackData = JSON.parse(req.body);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in text/plain body'
                });
            }
        } else {
            trackData = req.body;
        }

        const { station1ID, station2ID, distance } = trackData;

        // Validate that at least one field is provided
        if (!station1ID && !station2ID && distance === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update'
            });
        }

        // Convert distance to number if provided
        let parsedData = { ...trackData };
        if (distance !== undefined) {
            const distanceNum = Number(distance);
            if (isNaN(distanceNum) || distanceNum <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Distance must be a positive number'
                });
            }
            parsedData.distance = distanceNum;
        }

        const updatedTrack = await Track.update(id, parsedData);

        if (!updatedTrack) {
            return res.status(404).json({
                success: false,
                message: 'Track not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Track updated successfully',
            data: updatedTrack
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a track
export const deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Track.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Track not found or already deleted'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Track deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get tracks by station
export const getTracksByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const tracks = await Track.findByStationId(stationId);

        res.status(200).json({
            success: true,
            count: tracks.length,
            data: tracks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get track between two stations
export const getTrackBetweenStations = async (req, res) => {
    try {
        const { startId, endId } = req.params;

        const track = await Track.findBetweenStations(startId, endId);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: 'No track found between these stations'
            });
        }

        res.status(200).json({
            success: true,
            data: track
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};