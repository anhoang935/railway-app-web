import { useState, useEffect } from 'react';

export const useLoadingWithTimeout = (initialLoading = false, timeoutMs = 10000) => {
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState(null);

    // Timeout fallback
    useEffect(() => {
        if (!loading) return;

        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Request timed out. Please try again.');
            }
        }, timeoutMs);

        return () => clearTimeout(timeoutId);
    }, [loading, timeoutMs]);

    const startLoading = () => {
        setLoading(true);
        setError(null);
    };

    const stopLoading = () => {
        setLoading(false);
    };

    const setLoadingError = (errorMessage) => {
        setLoading(false);
        setError(errorMessage);
    };

    return {
        loading,
        error,
        setError,
        startLoading,
        stopLoading,
        setLoadingError
    };
};