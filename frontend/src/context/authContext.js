import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../data/Service/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = () => {
            console.log('AuthContext - checking auth status...');

            // Use authService to check authentication
            const isAuth = authService.isAuthenticated();
            const user = authService.getCurrentUser();

            console.log('AuthContext - auth check result:', {
                isAuthenticated: isAuth,
                user: user
            });

            if (isAuth && user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        };

        // Check immediately
        checkAuthStatus();

        // Listen for storage changes (for cross-tab synchronization)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken' || e.key === 'userId') {
                checkAuthStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const value = {
        currentUser,
        loading,
        setCurrentUser,
        setLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};