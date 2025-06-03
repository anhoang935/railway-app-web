import axios from 'axios';

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/tracks`;
    }
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/tracks`;
};

const BASE_URL = getBaseUrl();

const trackService = {
    getAllTracks: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching tracks:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch tracks';
        }
    },

    getTrack: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching track:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch track';
        }
    },

    getTracksByStation: async (stationId) => {
        try {
            const response = await axios.get(`${BASE_URL}/station/${stationId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching tracks by station:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch tracks by station';
        }
    },

    getTrackBetweenStations: async (startId, endId) => {
        try {
            const response = await axios.get(`${BASE_URL}/between/${startId}/${endId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching track between stations:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch track between stations';
        }
    },

    createTrack: async (trackData) => {
        try {
            const response = await axios.post(BASE_URL, trackData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating track:', error);
            throw error.response?.data?.message || error.message || 'Failed to create track';
        }
    },

    updateTrack: async (id, trackData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, trackData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating track:', error);
            throw error.response?.data?.message || error.message || 'Failed to update track';
        }
    },

    deleteTrack: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting track:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete track';
        }
    }
};

export default trackService;