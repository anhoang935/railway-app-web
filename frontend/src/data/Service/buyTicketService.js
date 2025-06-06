import axios from "axios";


const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';    
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/buy-ticket`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1/buy-ticket`;
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
            const response = await axios.get(`${BASE_URL}/search?${params.toString()}`);
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
    },

    getCoachesByTrainName: async (trainName) => {
        try {
            const response = await axios.get(`${BASE_URL}/coaches`, {
                params: { trainName }
            });
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
    },

    getBookedSeat: async (trainName, coachID, departureDate) => {
        try {
            const response = await axios.get(`${BASE_URL}/booked-seat`, {
                params: {trainName, coachID, departureDate}
            })
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