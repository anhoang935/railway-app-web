import { useRef } from 'react';
import { useAsyncData } from './useAsyncData';

/**
 * Custom hook for CoachManagement that wraps useAsyncData but suppresses loading states and errors
 * while still allowing underlying functionality to work
 */
export function useCoachManagementData(fetchFunction, dependencies = [], options = {}) {
    // Use the original hook directly - no state tracking needed
    const originalResult = useAsyncData(fetchFunction, dependencies, options);

    // Store the original fetch function for direct access if needed
    const fetchFunctionRef = useRef(fetchFunction);

    return {
        ...originalResult,
        loading: false,  // Always hide loading state
        error: null,     // Always hide error message
        // Keep all other functions intact to ensure they work correctly
    };
}

/**
 * Custom version of useLoadingWithTimeout that prevents loading states and errors
 * but still allows operations to complete
 */
export function useCoachManagementOperation() {
    // These functions track state internally but don't affect UI
    const startLoading = () => {
        console.log('Operation started (loading suppressed)');
        // Don't show loading UI but operation proceeds
    };

    const stopLoading = () => {
        console.log('Operation completed (loading suppressed)');
        // Don't show loading UI but operation completes
    };

    return {
        loading: false,     // Always hide loading state in UI
        error: null,        // Always hide error message in UI
        setError: () => { }, // No-op function
        startLoading,       // Function that allows operations to proceed
        stopLoading,        // Function that allows operations to complete
        setLoadingError: () => { } // No-op function
    };
}