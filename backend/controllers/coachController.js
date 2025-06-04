import Coach from '../models/Coaches.js';
import pool from '../Config/db.js';

export const getAllCoaches = async (req, res) => {
    try {
        const coaches = await Coach.findAll();

        res.status(200).json({
            success: true,
            count: coaches.length,
            data: coaches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await Coach.findById(id);

        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.status(200).json({
            success: true,
            data: coach
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCoachesByTrain = async (req, res) => {
    try {
        const { trainId } = req.params;
        const coaches = await Coach.findByTrainId(trainId);

        res.status(200).json({
            success: true,
            count: coaches.length,
            data: coaches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createCoach = async (req, res) => {
    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), 15000) // Reduced timeout
        );

        let coachData;
        if (req.headers['content-type'] === 'text/plain') {
            try {
                coachData = JSON.parse(req.body);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in text/plain body'
                });
            }
        } else {
            coachData = req.body;
        }

        const { trainID, coach_typeID } = coachData;

        // Validate required fields first
        if (!trainID || !coach_typeID) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Auto-generate coachID
        const [result] = await pool.query(`
            SELECT COALESCE(MAX(CAST(coachID AS UNSIGNED)), 0) + 1 as nextId 
            FROM coach 
            WHERE coachID REGEXP '^[0-9]+$'
        `);
        const coachID = result[0].nextId.toString();

        // Create coach without auto-updating counts
        const coach = await Promise.race([
            Coach.create({ coachID, trainID, coach_typeID }, false), // false = don't auto-update
            timeoutPromise
        ]);

        res.status(201).json({
            success: true,
            message: 'Coach created successfully',
            data: coach
        });
    } catch (error) {
        console.error('Controller error:', error);
        if (error.message === 'Operation timed out') {
            return res.status(408).json({
                success: false,
                message: 'Request timed out. Please try again.'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const { trainID, coach_typeID } = req.body;

        if (!trainID || !coach_typeID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide trainID and coach_typeID'
            });
        }

        const updatedCoach = await Coach.update(id, {
            trainID,
            coach_typeID
        });

        if (!updatedCoach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coach updated successfully',
            data: updatedCoach
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Coach.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coach deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const syncCoachCounts = async (req, res) => {
    try {
        // Increase timeout for sync operations
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sync operation timed out')), 45000)
        );

        await Promise.race([
            Coach.syncAllTrainCoachCounts(),
            timeoutPromise
        ]);

        res.status(200).json({
            success: true,
            message: 'All train coach counts have been synchronized'
        });
    } catch (error) {
        console.error('Controller error:', error);
        if (error.message === 'Sync operation timed out') {
            return res.status(408).json({
                success: false,
                message: 'Sync operation timed out. Please try again.'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const syncTrainCoachCount = async (req, res) => {
    try {
        const { trainId } = req.params;
        const actualCount = await Coach.updateTrainCoachCount(trainId);

        res.status(200).json({
            success: true,
            message: `Train ${trainId} coach count updated to ${actualCount}`,
            data: { trainID: trainId, coachTotal: actualCount }
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};