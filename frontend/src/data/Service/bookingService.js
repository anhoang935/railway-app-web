import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';    
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/bookings`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/bookings`;
};
const BASE_URL = getBaseUrl();

const bookingService = {
    getAllBookings: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch bookings';
        }
    },

    getBookingByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching booking by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch booking';
        }
    },

    getBookingsByPassenger: async (passengerId) => {
        try {
            const response = await axios.get(`${BASE_URL}/passenger/${passengerId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching bookings by passenger:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch bookings by passenger';
        }
    },

    // Enhanced method for user bookings with details
    getBookingsByUser: async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching bookings by user:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch user bookings';
        }
    },

    createBooking: async (bookingData) => {
        try {
            const response = await axios.post(BASE_URL, bookingData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error.response?.data?.message || error.message || 'Failed to create booking';
        }
    },

    updateBooking: async (id, bookingData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, bookingData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error.response?.data?.message || error.message || 'Failed to update booking';
        }
    },

    deleteBooking: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete booking';
        }
    },

    getBookingTickets: async (bookingId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${bookingId}/tickets`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching booking tickets:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch booking tickets';
        }
    },

    // Get detailed booking information
    getBookingDetails: async (bookingId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${bookingId}/details`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch booking details';
        }
    },

    // Get user booking statistics
    getUserBookingStats: async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}/stats`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user booking stats:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch booking statistics';
        }
    },

    // Cancel booking
    cancelBooking: async (bookingId, userId) => {
        try {
            const response = await axios.patch(`${BASE_URL}/${bookingId}/cancel`, { userId });
            return response.data.data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error.response?.data?.message || error.message || 'Failed to cancel booking';
        }
    },
};

export default bookingService;