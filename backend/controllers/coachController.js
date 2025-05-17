import Coach from '../models/Coaches.js';

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

        const { trainID, coach_typeID, coachID } = coachData;

        if (!trainID || !coach_typeID || !coachID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide trainID, coach_typeID, and coachID'
            });
        }

        const coach = await Coach.create({
            coachID,
            trainID,
            coach_typeID
        });

        res.status(201).json({
            success: true,
            message: 'Coach created successfully',
            data: coach
        });
    } catch (error) {
        console.error('Controller error:', error);
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