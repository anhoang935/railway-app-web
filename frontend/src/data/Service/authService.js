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

            console.log('Full OTP response:', response.data); // Debug the full response

            // Store token after successful OTP verification
            // Backend structure: response.data.data.token and response.data.data.user
            if (response.data && response.data.data && response.data.data.token) {
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('userId', response.data.data.user.userId.toString());
                localStorage.setItem('userEmail', response.data.data.user.email);
                localStorage.setItem('userName', response.data.data.user.username);
                localStorage.setItem('userRole', response.data.data.user.role || 'Customer');

                // Debug log to see what we're storing
                console.log('Storing auth data:', {
                    token: response.data.data.token ? 'exists' : 'missing',
                    userId: response.data.data.user.userId,
                    email: response.data.data.user.email,
                    username: response.data.data.user.username,
                    role: response.data.data.user.role
                });

                console.log('Final localStorage check:', {
                    authToken: localStorage.getItem('authToken'),
                    userId: localStorage.getItem('userId'),
                    userEmail: localStorage.getItem('userEmail'),
                    userName: localStorage.getItem('userName'),
                    userRole: localStorage.getItem('userRole')
                });
            } else {
                console.error('Token or user data missing in response structure:', {
                    hasData: !!response.data,
                    hasDataData: !!response.data?.data,
                    hasToken: !!response.data?.data?.token,
                    hasUser: !!response.data?.data?.user,
                    fullResponse: response.data
                });
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
        // Clear all auth-related localStorage items
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
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
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        console.log('isAuthenticated check:', {
            hasToken: !!token,
            hasUserId: !!userId,
            token: token ? 'exists' : 'missing',
            userId: userId || 'missing'
        });

        const isAuth = !!(token && userId);
        console.log('isAuthenticated result:', isAuth);
        return isAuth;
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            return null;
        }

        return {
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail'),
            role: localStorage.getItem('userRole')
        };
    }
};

export default authService;