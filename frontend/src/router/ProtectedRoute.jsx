import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../data/Service/authService';

const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute - Checking authentication...');

    // Use authService directly instead of context
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    console.log('ProtectedRoute - Auth check result:', {
        isAuthenticated: isAuth,
        user: user
    });

    if (!isAuth || !user) {
        console.log('ProtectedRoute - Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    console.log('ProtectedRoute - User authenticated, rendering children');
    return children;
};

export default ProtectedRoute;