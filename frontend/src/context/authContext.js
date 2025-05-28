import React, { createContext, useState, useEffect } from 'react';
import authService from '../data/Service/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const user = authService.getCurrentUser();
                user && setCurrentUser({
                    userID: user.userId,
                    email: user.email,
                    username: user.username
                });
            } catch (error) {
                console.error("Error checking authentication status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setCurrentUser({
            userID: userData.userId,
            email: userData.email,
            username: userData.username
        });
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
            {!loading ? children : <div>Loading authentication...</div>}
        </AuthContext.Provider>
    );
};