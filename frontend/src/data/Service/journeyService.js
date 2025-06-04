import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/journeys`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/journeys`;
};
const BASE_URL = getBaseUrl();

const journeyService = {
    getAllJourneys: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching journeys:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch journeys';
        }
    },

    getJourneyByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching journey by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch journey';
        }
    },

    getJourneysByTrain: async (trainId) => {
        try {
            const response = await axios.get(`${BASE_URL}/train/${trainId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching journeys by train:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch journeys by train';
        }
    },

    createJourney: async (journeyData) => {
        try {
            const response = await axios.post(BASE_URL, journeyData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating journey:', error);
            throw error.response?.data?.message || error.message || 'Failed to create journey';
        }
    },

    updateJourney: async (id, journeyData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, journeyData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating journey:', error);
            throw error.response?.data?.message || error.message || 'Failed to update journey';
        }
    },

    deleteJourney: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting journey:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete journey';
        }
    }
};

export default journeyService;