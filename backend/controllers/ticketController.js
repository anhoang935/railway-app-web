import Tickets from '../models/Tickets.js'

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