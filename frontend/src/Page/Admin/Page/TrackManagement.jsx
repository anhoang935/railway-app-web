import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import trackService from '../../../data/Service/trackService';
import stationService from '../../../data/Service/stationService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';

const TrackManagement = () => {
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        station1ID: '',
        station2ID: '',
        distance: ''
    });

    // Use useAsyncData for initial data fetching
    const {
        data: tracks,
        loading: tracksLoading,
        error: tracksError,
        refetch: refetchTracks,
        setData: setTracks
    } = useAsyncData(() => trackService.getAllTracks());

    const {
        data: stations,
        loading: stationsLoading,
        error: stationsError,
        refetch: refetchStations
    } = useAsyncData(() => stationService.getAllStations());

    // Use useLoadingWithTimeout for operations
    const {
        loading: operationLoading,
        error: operationError,
        setError: setOperationError,
        startLoading,
        stopLoading,
        setLoadingError
    } = useLoadingWithTimeout();

    // Show loading page while initial data loads
    const isInitialLoading = tracksLoading || stationsLoading;

    if (isInitialLoading) {
        let loadingMessage = "Loading track management...";
        if (tracksLoading) loadingMessage = "Loading tracks...";
        else if (stationsLoading) loadingMessage = "Loading stations...";

        return <LoadingPage message={loadingMessage} />;
    }

    // Combine error states
    const currentError = tracksError || stationsError || operationError;
    const hasDataError = tracksError || stationsError;

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // For number fields like distance
        if (name === 'distance') {
            // Allow empty string during typing
            const newValue = value === '' ? '' : value;
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Start adding a new track
    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({
            station1ID: '',
            station2ID: '',
            distance: ''
        });
        setOperationError(null);
    };

    // Start editing an existing track
    const handleEdit = (track) => {
        setIsAdding(false);
        setEditingId(track.trackID);
        setFormData({
            station1ID: track.station1ID,
            station2ID: track.station2ID,
            distance: track.distance
        });
        setOperationError(null);
    };

    // Cancel adding/editing
    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            station1ID: '',
            station2ID: '',
            distance: ''
        });
        setOperationError(null);
    };

    // Validate form data
    const validateForm = () => {
        console.log("Validating form data:", formData);

        if (!formData.station1ID) {
            setOperationError('Please select station 1');
            return false;
        }

        if (!formData.station2ID) {
            setOperationError('Please select station 2');
            return false;
        }

        if (formData.station1ID === formData.station2ID) {
            setOperationError('Station 1 and station 2 cannot be the same');
            return false;
        }

        if (formData.distance === '' ||
            formData.distance === null ||
            formData.distance === undefined ||
            isNaN(Number(formData.distance)) ||
            Number(formData.distance) <= 0) {
            setOperationError('Please enter a valid positive number for distance');
            return false;
        }

        return true;
    };

    // Save a new track
    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            // Create a clean object with values properly formatted
            const trackToCreate = {
                station1ID: formData.station1ID,
                station2ID: formData.station2ID,
                distance: Number(formData.distance)
            };

            console.log("Creating track with data:", trackToCreate);

            await trackService.createTrack(trackToCreate);

            // Refresh data to get updated list
            await refetchTracks();

            setIsAdding(false);
            setFormData({
                station1ID: '',
                station2ID: '',
                distance: ''
            });
            setOperationError(null);

            stopLoading();
        } catch (err) {
            setLoadingError('Failed to create track: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Update an existing track
    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            // Create a clean object with values properly formatted
            const trackToUpdate = {
                station1ID: formData.station1ID,
                station2ID: formData.station2ID,
                distance: Number(formData.distance)
            };

            console.log("Updating track ID:", editingId, "with data:", trackToUpdate);

            await trackService.updateTrack(editingId, trackToUpdate);

            // Refresh data to get updated list
            await refetchTracks();

            setEditingId(null);
            setFormData({
                station1ID: '',
                station2ID: '',
                distance: ''
            });
            setOperationError(null);

            stopLoading();
        } catch (err) {
            setLoadingError('Failed to update track: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Delete a track
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this track?')) {
            try {
                startLoading();

                await trackService.deleteTrack(id);

                // Refresh data to get updated list
                await refetchTracks();

                setOperationError(null);
                stopLoading();
            } catch (err) {
                setLoadingError('Failed to delete track: ' + (err.toString() || 'Unknown error'));
                console.error(err);
            }
        }
    };

    // Get station name by ID for display
    const getStationName = (stationID) => {
        if (!stations) return 'Unknown Station';
        const station = stations.find(s => s.stationID === stationID);
        return station ? station.stationName : 'Unknown Station';
    };

    // Handle refresh/retry functionality
    const handleRefreshData = async () => {
        try {
            startLoading();

            // Refresh data sources that have errors
            const refreshPromises = [];
            if (tracksError) refreshPromises.push(refetchTracks());
            if (stationsError) refreshPromises.push(refetchStations());

            // If no specific errors, refresh all
            if (!hasDataError) {
                refreshPromises.push(refetchTracks(), refetchStations());
            }

            await Promise.all(refreshPromises);
            setOperationError(null);
            stopLoading();
        } catch (error) {
            setLoadingError('Failed to refresh data: ' + error.toString());
        }
    };

    return (
        <div className="p-4 h-screen flex flex-col track-management relative">
            {/* Only show operation loading overlay */}
            {operationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing...</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Track Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefreshData}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh all data"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="mr-2" /> Add New Track
                    </button>
                </div>
            </div>

            {/* Error message */}
            {currentError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {hasDataError ? 'Data Loading Error' : 'Operation Error'}
                            </p>
                            <p className="mt-1">{currentError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setOperationError(null);
                                if (hasDataError) handleRefreshData();
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Data status info */}
            <div className="mb-4 text-sm text-gray-600">
                <p>
                    <strong>Tracks:</strong> {tracks?.length || 0} |
                    <strong> Stations:</strong> {stations?.length || 0} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Table container */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Track ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station 1</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station 2</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Distance (km)</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add new track row - sticky below header */}
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <span className="text-gray-500 italic">Auto-generated</span>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="station1ID"
                                        value={formData.station1ID}
                                        onChange={handleChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Station 1</option>
                                        {stations && stations.map(station => (
                                            <option key={station.stationID} value={station.stationID}>
                                                {station.stationName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="station2ID"
                                        value={formData.station2ID}
                                        onChange={handleChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Station 2</option>
                                        {stations && stations.map(station => (
                                            <option key={station.stationID} value={station.stationID}>
                                                {station.stationName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="number"
                                        name="distance"
                                        value={formData.distance}
                                        onChange={handleChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Distance in km"
                                        min="1"
                                        step="1"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={handleSaveNew}
                                            disabled={operationLoading}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                        >
                                            <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={operationLoading}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                        >
                                            <FaTimes className="mr-1" /> Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {/* Track list rows */}
                        {tracks && tracks.length > 0 ? (
                            tracks.map((track) => (
                                <tr key={track.trackID} className={editingId === track.trackID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-medium">
                                        {track.trackID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === track.trackID ? (
                                            <select
                                                name="station1ID"
                                                value={formData.station1ID}
                                                onChange={handleChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                {stations && stations.map(station => (
                                                    <option key={station.stationID} value={station.stationID}>
                                                        {station.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            track.station1Name || getStationName(track.station1ID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === track.trackID ? (
                                            <select
                                                name="station2ID"
                                                value={formData.station2ID}
                                                onChange={handleChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                {stations && stations.map(station => (
                                                    <option key={station.stationID} value={station.stationID}>
                                                        {station.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            track.station2Name || getStationName(track.station2ID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === track.trackID ? (
                                            <input
                                                type="number"
                                                name="distance"
                                                value={formData.distance}
                                                onChange={handleChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                min="1"
                                                step="1"
                                            />
                                        ) : (
                                            `${track.distance} km`
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === track.trackID ? (
                                                <>
                                                    <button
                                                        onClick={handleUpdate}
                                                        disabled={operationLoading}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                    >
                                                        <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        disabled={operationLoading}
                                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                    >
                                                        <FaTimes className="mr-1" /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(track)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(track.trackID)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaTrash className="mr-1" /> Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No tracks found. Add a new track to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrackManagement;