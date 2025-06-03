import axios from "axios";

const getBaseUrl = () => {
    // If running on localhost
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/timetable';
    }

    // For mobile/other networks, use current host
    return `${window.location.protocol}//${window.location.hostname}:5000/api/timetable`;
};

const BASE_URL = getBaseUrl();

const timetableService = {
    // Get all stations
    getAllStations: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/stations`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching stations:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch stations';
        }
    },

    // Get all tracks for distance calculation
    getAllTracks: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/tracks`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching tracks:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch tracks';
        }
    },

    // Get all coach types
    getAllCoachTypes: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/coach-types`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching coach types:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch coach types';
        }
    },

    // Get coaches for a specific train
    getTrainCoaches: async (trainId) => {
        try {
            const response = await axios.get(`${BASE_URL}/coaches/train/${trainId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching train coaches:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch train coaches';
        }
    },

    // Search trains between stations
    searchTrains: async (params) => {
        try {
            const { departureStation, arrivalStation, departureDate } = params;
            const queryParams = new URLSearchParams({
                departureStation,
                arrivalStation,
                departureDate
            }).toString();
            
            const response = await axios.get(`${BASE_URL}/search?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Error searching trains:', error);
            throw error.response?.data?.message || error.message || 'Failed to search trains';
        }
    },

    // Get journey details for a specific schedule
    getJourneysBySchedule: async (scheduleId) => {
        try {
            const response = await axios.get(`${BASE_URL}/journeys/schedule/${scheduleId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching journeys by schedule:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch journeys';
        }
    },

    // Get schedule details by ID
    getScheduleById: async (scheduleId) => {
        try {
            const response = await axios.get(`${BASE_URL}/schedules/${scheduleId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedule by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedule';
        }
    },

    // Get schedules between two stations
    getSchedulesBetweenStations: async (fromStationId, toStationId) => {
        try {
            const response = await axios.get(`${BASE_URL}/schedules/route/${fromStationId}/${toStationId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching schedules between stations:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch schedules between stations';
        }
    }
};

export default timetableService;