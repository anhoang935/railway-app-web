import axios from "axios";

const getBaseUrl = () => {
    const port = '5000';
    // const port = '25422';    
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1/auth`;
    }
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/auth`;
};

const BASE_URL = getBaseUrl();

const authService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, userData);
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(`${BASE_URL}/login`, {
                email: credentials.email,
                password: credentials.password
            });

            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    verifyLoginOTP: async (userId, otp) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify-login-otp`, {
                userId,
                otp
            });

            // Store token after successful OTP verification
            if (response.data.data.token) {
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('userId', response.data.data.user.userId.toString());
                localStorage.setItem('userEmail', response.data.data.user.email);
                localStorage.setItem('userName', response.data.data.user.username);
            }

            return response.data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    },

    resendOTP: async (userId) => {
        try {
            const response = await axios.post(`${BASE_URL}/resend-otp`, {
                userId
            });
            return response.data;
        } catch (error) {
            console.error('Error resending OTP:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
    },

    verifyEmail: async (userId, verifyCode) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify-email`, {
                userId,
                verifyCode
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${BASE_URL}/forgot-password`, {
                email
            });
            return response.data;
        } catch (error) {
            console.error('Error sending forgot password:', error);
            throw error;
        }
    },

    resetPassword: async (email, verifyCode, newPassword) => {
        try {
            const response = await axios.post(`${BASE_URL}/reset-password`, {
                email,
                verifyCode,
                newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    },

    resendVerificationCode: async (userId) => {
        try {
            const response = await axios.post(`${BASE_URL}/resend-verification`, {
                userId
            });
            return response.data;
        } catch (error) {
            console.error('Error resending verification code:', error);
            throw error;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');

        if (token && userId) {
            return {
                userId: parseInt(userId),
                email: userEmail,
                username: userName,
                token
            };
        }
        return null;
    }
};

export default authService;