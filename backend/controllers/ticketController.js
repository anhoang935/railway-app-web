import Tickets from '../models/Tickets.js';

// // Get all tickets
// export const getAllTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket.findAll();
    
//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       data: tickets
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get a single ticket
// export const getTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ticket = await Ticket.findById(id);
    
//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ticket not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: ticket
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get tickets by passenger ID
// export const getTicketsByPassenger = async (req, res) => {
//   try {
//     const { passengerId } = req.params;
//     const tickets = await Ticket.findByPassengerId(passengerId);
    
//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       data: tickets
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get tickets by booking ID
// export const getTicketsByBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const tickets = await Ticket.findByBookingId(bookingId);
    
//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       data: tickets
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get tickets by train ID
// export const getTicketsByTrain = async (req, res) => {
//   try {
//     const { trainId } = req.params;
//     const tickets = await Ticket.findByTrainId(trainId);
    
//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       data: tickets
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get available seats
// export const getAvailableSeats = async (req, res) => {
//   try {
//     const { trainId, date, coachId } = req.params;
    
//     if (!trainId || !date || !coachId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide trainId, date, and coachId'
//       });
//     }
    
//     const seatInfo = await Ticket.getAvailableSeats(trainId, date, coachId);
    
//     res.status(200).json({
//       success: true,
//       data: seatInfo
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Create a new ticket
// export const createTicket = async (req, res) => {
//   try {
//     let ticketData;
    
//     // If content type is text/plain, try to parse it as JSON
//     if (req.headers['content-type'] === 'text/plain') {
//       try {
//         ticketData = JSON.parse(req.body);
//       } catch (e) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid JSON in text/plain body'
//         });
//       }
//     } else {
//       // Otherwise use the parsed body directly
//       ticketData = req.body;
//     }
    
//     const { 
//       bookingID, 
//       passengerID, 
//       trainID, 
//       seatNumber, 
//       departure_stationID, 
//       arrival_stationID, 
//       departureTime, 
//       departureDate, 
//       ticketPrice, 
//       coachID 
//     } = ticketData;
    
//     if (!bookingID || !passengerID || !trainID || !seatNumber || !departure_stationID || 
//         !arrival_stationID || !departureTime || !departureDate || !ticketPrice) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields: bookingID, passengerID, trainID, seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice'
//       });
//     }
    
//     const ticket = await Ticket.create({
//       bookingID,
//       passengerID,
//       trainID,
//       seatNumber,
//       departure_stationID,
//       arrival_stationID,
//       departureTime,
//       departureDate,
//       ticketPrice,
//       coachID
//     });
    
//     res.status(201).json({
//       success: true,
//       message: 'Ticket created successfully',
//       data: ticket
//     });
//   } catch (error) {
//     console.error('Controller error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update a ticket
// export const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let ticketData;
    
//     // If content type is text/plain, try to parse it as JSON
//     if (req.headers['content-type'] === 'text/plain') {
//       try {
//         ticketData = JSON.parse(req.body);
//       } catch (e) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid JSON in text/plain body'
//         });
//       }
//     } else {
//       // Otherwise use the parsed body directly
//       ticketData = req.body;
//     }
    
//     const updatedTicket = await Ticket.update(id, ticketData);
    
//     if (!updatedTicket) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ticket not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Ticket updated successfully',
//       data: updatedTicket
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Delete a ticket
// export const deleteTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Ticket.delete(id);
    
//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: 'Ticket not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Ticket deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };import Tickets from '../models/Tickets.js'

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Tickets.findAll();

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getFilteredTickets = async (req, res) => {
    try{
        // const filters = {
        //     ticketId: req.params.id,
        //     ...req.query
        // };
        const tickets = await Tickets.findByFilter(req.query);

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Tickets.deleteById(id);

        if(!ticket){
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Ticket successfully removed'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const createTicket = async (req, res) => {
    try {
        const ticket = await Tickets.create(req.body);
        
        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}