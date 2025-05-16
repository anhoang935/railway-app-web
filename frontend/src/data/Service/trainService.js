import axios from "axios";

const getBaseUrl = () => {
    // If running on localhost
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1/trains';
    }

    // For mobile/other networks, use current host
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1/trains`
};

const BASE_URL = getBaseUrl();

const trainService = {
    getAllTrains: async () => {
        try{
            const response = await axios.get(BASE_URL);
            return response.data.data;
        }
        catch(error){
            console.error('Error fetching trains:', error);
            throw error.response?.data?.message || error.message || 'Failed to update train';
        }
    },
    getTrainByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching train by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch train';
            
        }
    },
    createTrain: async (trainData) => {
        try{
            const dataWithID = { 
                ...trainData, 
                trainID: 0  // Use 0 as a placeholder, server will replace with auto-incremented value
            };
            const response = await axios.post(BASE_URL, dataWithID);
            return response.data.data;
        } 
        catch (error){
            console.error('Error creating train:', error);
            throw error.response?.data?.message || error.message || 'Failed to create train';
        }
    },
    updateTrain: async (id, trainData) => {
        try{
            const dataWithID = { 
                ...trainData, 
                trainID: 0  // Use 0 as a placeholder, server will replace with auto-incremented value
            };
            const response = await axios.put(`${BASE_URL}/${id}`, dataWithID);
            return response.data.data;
        } 
        catch(error){
            console.error('Error updating train:', error);
            throw error.response?.data?.message || error.message || 'Failed to update train';
        }
    },

    
    deleteTrain: async (id) => {
        try{
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } 
        catch(error){
            console.error('Error deleting train:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete train';
        }
    },
}
export default trainService;