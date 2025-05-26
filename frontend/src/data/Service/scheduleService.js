import axios from "axios";

const getBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1/schedules';
    }
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1/schedules`;
};

const BASE_URL = getBaseUrl();

const scheduleService = {
    getAllSchedules: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedules';
        }
    },

    getScheduleByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedule by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedule';
        }
    },

    getSchedulesByTrain: async (trainId) => {
        try {
            const response = await axios.get(`${BASE_URL}/train/${trainId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedules by train:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedules by train';
        }
    },

    getSchedulesByStation: async (stationId) => {
        try {
            const response = await axios.get(`${BASE_URL}/station/${stationId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedules by station:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedules by station';
        }
    },

    getSchedulesBetweenStations: async (startId, endId) => {
        try {
            const response = await axios.get(`${BASE_URL}/route/${startId}/${endId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedules between stations:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedules between stations';
        }
    },

    createSchedule: async (scheduleData) => {
        try {
            const response = await axios.post(BASE_URL, scheduleData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error.response?.data?.message || error.message || 'Failed to create schedule';
        }
    },

    updateSchedule: async (id, scheduleData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, scheduleData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error.response?.data?.message || error.message || 'Failed to update schedule';
        }
    },

    deleteSchedule: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete schedule';
        }
    }
};

export default scheduleService;