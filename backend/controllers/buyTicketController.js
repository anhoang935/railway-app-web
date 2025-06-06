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

export const getCoachesByTrainName = async (req, res) => {
    try {
        const { trainName } = req.query;

        if (!trainName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a trainName'
            });
        }

        const coaches = await Buy_Ticket.getCoachesByTrainName(trainName);

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

export const getSeatBooked = async (req, res) => {
    try {
        const {trainName, coachID, departureDate} = req.query;
        if(!trainName || !coachID){
            return res.status(400).json({
                success: false,
                message: 'Please provide both trainName and coachID'
            })
        }

        const seats = await Buy_Ticket.getSeatBooked(trainName, coachID, departureDate)
        res.status(200).json({
            success:  true,
            count: seats.length,
            data: seats
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}