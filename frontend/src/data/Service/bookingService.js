import axios from "axios";

const getBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1/bookings';
    }
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1/bookings`;
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

    getBookingsByUser: async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching bookings by user:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch bookings by user';
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
    }
};

export default bookingService;