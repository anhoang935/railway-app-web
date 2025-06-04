import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/passengers`;
    }
    // return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/passengers`;
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/passengers`;

};

const BASE_URL = getBaseUrl();

const passengerService = {
    getAllPassengers: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching passengers:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch passengers';
        }
    },

    getPassengerByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching passenger by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch passenger';
        }
    },

    getPassengerBookings: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/bookings`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching passenger bookings:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch passenger bookings';
        }
    },

    getPassengerTickets: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/tickets`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching passenger tickets:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch passenger tickets';
        }
    },

    createPassenger: async (passengerData) => {
        try {
            const response = await axios.post(BASE_URL, passengerData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating passenger:', error);
            throw error.response?.data?.message || error.message || 'Failed to create passenger';
        }
    },

    updatePassenger: async (id, passengerData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, passengerData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating passenger:', error);
            throw error.response?.data?.message || error.message || 'Failed to update passenger';
        }
    },

    deletePassenger: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting passenger:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete passenger';
        }
    }
};

export default passengerService;