import axios from "axios";

// Remove timeout completely for background operations
const apiNoTimeout = axios.create({
    timeout: 0, // No timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Keep a short timeout only for quick operations
const apiQuick = axios.create({
    timeout: 10000, // 10 seconds for read operations
    headers: {
        'Content-Type': 'application/json'
    }
});

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';    
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/coaches`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/coaches`;
};
const BASE_URL = getBaseUrl();

const coachService = {
    // Quick read operation - keep timeout
    getAllCoaches: async () => {
        try {
            const response = await apiQuick.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coaches:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coaches';
        }
    },

    // Write operations - NO TIMEOUT (this fixes your issue)
    createCoach: async (coachData) => {
        try {
            const response = await apiNoTimeout.post(BASE_URL, coachData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to create coach';
        }
    },

    updateCoach: async (id, coachData) => {
        try {
            const response = await apiNoTimeout.put(`${BASE_URL}/${id}`, coachData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to update coach';
        }
    },

    deleteCoach: async (id) => {
        try {
            await apiNoTimeout.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting coach:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete coach';
        }
    },

    // Sync operations - NO TIMEOUT
    syncAllCoachCounts: async () => {
        try {
            const response = await apiNoTimeout.post(`${BASE_URL}/sync/all`, {});
            return response.data;
        } catch (error) {
            console.error('Error syncing all coach counts:', error);
            throw error.response?.data?.message || error.message || 'Failed to sync coach counts';
        }
    },

    syncTrainCoachCount: async (trainId) => {
        try {
            const response = await apiNoTimeout.post(`${BASE_URL}/sync/train/${trainId}`);
            return response.data;
        } catch (error) {
            console.error('Error syncing train coach count:', error);
            throw error.response?.data?.message || error.message || 'Failed to sync train coach count';
        }
    }
};

export default coachService;