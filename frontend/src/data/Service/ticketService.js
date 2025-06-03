import axios from "axios";

const getBaseUrl = () => {
    // const port = '5000';
    const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/tickets`;
    }
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/tickets`;
};

const BASE_URL = getBaseUrl();

const ticketService = {
    getAllTickets: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/all`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch tickets';
        }
    },

    // getTicketByID: async (id) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/${id}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching ticket by ID:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to fetch ticket';
    //     }
    // },

    // getTicketsByPassenger: async (passengerId) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/passenger/${passengerId}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching tickets by passenger:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to fetch tickets by passenger';
    //     }
    // },

    // getTicketsByBooking: async (bookingId) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/booking/${bookingId}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching tickets by booking:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to fetch tickets by booking';
    //     }
    // },

    // getTicketsByTrain: async (trainId) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/train/${trainId}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching tickets by train:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to fetch tickets by train';
    //     }
    // },

    // getAvailableSeats: async (trainId, date, coachId) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/seats/${trainId}/${date}/${coachId}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching available seats:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to fetch available seats';
    //     }
    // },

    createTicket: async (ticketData) => {
        try {
            const response = await axios.post(BASE_URL, ticketData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error.response?.data?.message || error.message || 'Failed to create ticket';
        }
    },

    // updateTicket: async (id, ticketData) => {
    //     try {
    //         const response = await axios.put(`${BASE_URL}/${id}`, ticketData);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error updating ticket:', error);
    //         throw error.response?.data?.message || error.message || 'Failed to update ticket';
    //     }
    // },

    deleteTicket: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting ticket:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete ticket';
        }
    },

    getFilteredTickets: async (filters) => {
        try {
            const responses = await axios.get(BASE_URL, {params:filters});
            return responses.data.data;
        } catch (err) {
            console.error('Error filtering ticket:', err);
            throw err.response?.data?.message || err.message || 'Failed to filter ticket';
        }
    }
};

export default ticketService;