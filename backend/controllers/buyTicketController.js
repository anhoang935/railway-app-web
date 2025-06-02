import Buy_Ticket from "../models/Buy_Ticket.js";

export const searchTrains = async (req, res) => {
    try {
        const { departureStation, arrivalStation, arrivalTime } = req.query;
    
        if (!departureStation || !arrivalStation) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both departureStation and arrivalStation'
            });
        }

        const trains = await Buy_Ticket.findTrain(departureStation, arrivalStation, arrivalTime);
    
        res.status(200).json({
            success: true,
            count: trains.length,
            data: trains
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: error.message
        });
    }
};