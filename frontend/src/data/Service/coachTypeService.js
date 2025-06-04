import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/coach-types`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/coach-types`;
};
const BASE_URL = getBaseUrl();

const coachTypeService = {
    getAllCoachTypes: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coach types:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coach types';
        }
    },

    getCoachTypeById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coach type:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coach type';
        }
    },

    createCoachType: async (coachTypeData) => {
        try {
            const response = await axios.post(BASE_URL, coachTypeData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating coach type:', error);
            throw error.response?.data?.message || error.message || 'Failed to create coach type';
        }
    },

    updateCoachType: async (id, coachTypeData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, coachTypeData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating coach type:', error);
            throw error.response?.data?.message || error.message || 'Failed to update coach type';
        }
    },

    deleteCoachType: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting coach type:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete coach type';
        }
    }
};

export default coachTypeService;