import { useState, useEffect } from 'react';

export const useAsyncData = (fetchFunction, dependencies = [], options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { enableBlankPage = true } = options; // New option

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await fetchFunction();
            setData(result || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    // Timeout fallback
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Request timed out. Please try again.');
            }
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [loading]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        setData,
        enableBlankPage
    };
};