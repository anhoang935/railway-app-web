import Journey from '../models/Journeys.js';

// Get all journeys
export const getAllJourneys = async (req, res) => {
    try {
        const journeys = await Journey.findAll();

        res.status(200).json({
            success: true,
            count: journeys.length,
            data: journeys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single journey
export const getJourney = async (req, res) => {
    try {
        const { id } = req.params;
        const journey = await Journey.findById(id);

        if (!journey) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found'
            });
        }

        res.status(200).json({
            success: true,
            data: journey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get journeys by train
export const getJourneysByTrain = async (req, res) => {
    try {
        const { trainId } = req.params;
        const journeys = await Journey.findByTrainId(trainId);

        res.status(200).json({
            success: true,
            count: journeys.length,
            data: journeys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create a new journey
export const createJourney = async (req, res) => {
    try {
        let journeyData;

        // If content type is text/plain, try to parse it as JSON
        if (req.headers['content-type'] === 'text/plain') {
            try {
                journeyData = JSON.parse(req.body);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in text/plain body'
                });
            }
        } else {
            // Otherwise use the parsed body directly
            journeyData = req.body;
        }

        const { trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance } = journeyData;

        if (!trainID || !departureStationID || !arrivalStationID || !departureTime || !arrivalTime || !journeyDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, and journeyDate'
            });
        }

        const journey = await Journey.create({
            trainID,
            departureStationID,
            arrivalStationID,
            departureTime,
            arrivalTime,
            journeyDate,
            distance
        });

        res.status(201).json({
            success: true,
            message: 'Journey created successfully',
            data: journey
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a journey
export const updateJourney = async (req, res) => {
    try {
        const { id } = req.params;
        const { trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, journeyDate, distance } = req.body;

        // Validate request
        if (!trainID || !departureStationID || !arrivalStationID || !departureTime || !arrivalTime || !journeyDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide trainID, departureStationID, arrivalStationID, departureTime, arrivalTime, and journeyDate'
            });
        }

        const updatedJourney = await Journey.update(id, {
            trainID,
            departureStationID,
            arrivalStationID,
            departureTime,
            arrivalTime,
            journeyDate,
            distance
        });

        if (!updatedJourney) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Journey updated successfully',
            data: updatedJourney
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a journey
export const deleteJourney = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Journey.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Journey deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};