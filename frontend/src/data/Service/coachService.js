import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';    
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/coaches`;
    }
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/coaches`;
};
const BASE_URL = getBaseUrl();

const coachService = {
    getAllCoaches: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coaches:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coaches';
        }
    },

    getCoachByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coach by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coach';
        }
    },

    getCoachesByTrain: async (trainId) => {
        try {
            const response = await axios.get(`${BASE_URL}/train/${trainId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coaches by train:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coaches by train';
        }
    },

    createCoach: async (coachData) => {
        try {
            const response = await axios.post(BASE_URL, coachData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to create coach';
        }
    },

    updateCoach: async (id, coachData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, coachData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to update coach';
        }
    },

    deleteCoach: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete coach';
        }
    },

    // Admin sync functions
    syncAllCoachCounts: async () => {
        try {
            const response = await axios.post(`${BASE_URL}/sync/all`);
            return response.data;
        } catch (error) {
            console.error('Error syncing all coach counts:', error);
            throw error.response?.data?.message || error.message || 'Failed to sync coach counts';
        }
    },

    syncTrainCoachCount: async (trainId) => {
        try {
            const response = await axios.post(`${BASE_URL}/sync/train/${trainId}`);
            return response.data;
        } catch (error) {
            console.error('Error syncing train coach count:', error);
            throw error.response?.data?.message || error.message || 'Failed to sync train coach count';
        }
    }
};

export default coachService;