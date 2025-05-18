import axios from "axios";


const getBaseUrl = () => {
    // If running on localhost
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1/stations';
    }

    // For mobile/other networks, use current host
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1/stations`
};

const BASE_URL = getBaseUrl();

const stationService = {
    getAllStations: async () => {
        try{
            const response = await axios.get(BASE_URL);
            return response.data.data;
        }
        catch(error){
            console.error('Error fetching stations:', error);
            throw error.response?.data?.message || error.message || 'Failed to update station';
        }
    },
    getStationByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching station by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch station';
            
        }
    },
    createStation: async (stationData) => {
        try{
            const dataWithID = { 
                ...stationData, 
                stationID: 0  // Use 0 as a placeholder, server will replace with auto-incremented value
            };
            const response = await axios.post(BASE_URL, dataWithID);
            return response.data.data;
        } 
        catch (error){
            console.error('Error creating station:', error);
            throw error.response?.data?.message || error.message || 'Failed to create station';
        }
    },
    updateStation: async (id, stationData) => {
        try{
            const dataWithID = { 
                ...stationData, 
                stationID: 0  // Use 0 as a placeholder, server will replace with auto-incremented value
            };
            const response = await axios.put(`${BASE_URL}/${id}`, dataWithID);
            return response.data.data;
        } 
        catch(error){
            console.error('Error updating station:', error);
            throw error.response?.data?.message || error.message || 'Failed to update station';
        }
    },
    deleteStation: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting station:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete station';
        }
    }
}
export default stationService;