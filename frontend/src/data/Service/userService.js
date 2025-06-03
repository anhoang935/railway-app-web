import axios from "axios";

const getBaseUrl = () => {
    // const port = '5000';
    const port = '25422';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/users`;
    }
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/users`;
};
const BASE_URL = getBaseUrl();

const authHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
    getAllUsers: async () => {
        try {
            const response = await axios.get(BASE_URL, { headers: authHeader() });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch users';
        }
    },

    getUserByID: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, { headers: authHeader() });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch user';
        }
    },

    getUserByEmail: async (email) => {
        try {
            const response = await axios.get(`${BASE_URL}/email/${email}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch user by email';
        }
    },

    getUsersByStatus: async (status) => {
        try {
            const response = await axios.get(`${BASE_URL}/status/${status}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching users by status:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch users by status';
        }
    },

    getUserStats: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/stats`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch user stats';
        }
    },

    getUserBookings: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/bookings`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch user bookings';
        }
    },

    createUser: async (userData) => {
        try {
            const response = await axios.post(BASE_URL, userData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error.response?.data?.message || error.message || 'Failed to create user';
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, userData, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error.response?.data?.message || error.message || 'Failed to update user';
        }
    },

    verifyUserEmail: async (id, verifyCode) => {
        try {
            const response = await axios.post(`${BASE_URL}/${id}/verify-email`, { verifyCode });
            return response.data.data;
        } catch (error) {
            console.error('Error verifying user email:', error);
            throw error.response?.data?.message || error.message || 'Failed to verify email';
        }
    },

    updateUserPassword: async (id, passwordData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}/password`, passwordData, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user password:', error);
            throw error.response?.data?.message || error.message || 'Failed to update password';
        }
    },

    deleteUser: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error.response?.data?.message || error.message || 'Failed to delete user';
        }
    }
};

export default userService;