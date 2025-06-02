import axios from "axios";


const getBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1/search';
    }
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1/search`;
};

const BASE_URL = getBaseUrl();

const buyTicketService = {
    searchTrains: async (departureStation, arrivalStation, arrivalTime) => {
        try {
            const timeToUse = arrivalTime || new Date().toTimeString().slice(0, 8);
            const params = new URLSearchParams({
                departureStation,
                arrivalStation,
                arrivalTime: timeToUse
            });
            const response = await axios.get(`${BASE_URL}?${params.toString()}`);
            return {
                success: true,
                data: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            if (error.response) {
                return {
                    success: false,
                    message: error.response.data.message || 'Server error occurred',
                    status: error.response.status
                };
            } else if (error.request) {
                return {
                    success: false,
                    message: 'No response from server. Please check your connection.',
                    status: 0
                };
            } else {
                return {
                    success: false,
                    message: error.message || 'An unexpected error occurred',
                    status: 0
                };
            }
        }
    }
}

export default buyTicketService;