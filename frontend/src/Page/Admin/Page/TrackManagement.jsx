import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import trackService from '../../../data/Service/trackService';
import stationService from '../../../data/Service/stationService';

const TrackManagement = () => {
    const [tracks, setTracks] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        station1ID: '',
        station2ID: '',
        distance: ''
    });

    // Fetch tracks and stations on component mount
    useEffect(() => {
        fetchTrackAndStationData();
    }, []);

    const fetchTrackAndStationData = async () => {
        try {
            setLoading(true);
            const [tracksData, stationsData] = await Promise.all([
                trackService.getAllTracks(),
                stationService.getAllStations()
            ]);

            setTracks(tracksData);
            setStations(stationsData);
            setError(null);
        } catch (err) {
            setError('Failed to load data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTracks = async () => {
        try {
            const tracksData = await trackService.getAllTracks();
            setTracks(tracksData);
            setError(null);
        } catch (err) {
            setError('Failed to load tracks. Please try again later.');
            console.error(err);
        }
    };

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
    };

    // Validate form data
    const validateForm = () => {
        // Log the form data to help with debugging
        console.log("Validating form data:", formData);

        if (!formData.station1ID) {
            setError('Please select station 1');
            return false;
        }

        if (!formData.station2ID) {
            setError('Please select station 2');
            return false;
        }

        if (formData.station1ID === formData.station2ID) {
            setError('Station 1 and station 2 cannot be the same');
            return false;
        }

        if (formData.distance === '' ||
            formData.distance === null ||
            formData.distance === undefined ||
            isNaN(Number(formData.distance)) ||
            Number(formData.distance) <= 0) {
            setError('Please enter a valid positive number for distance');
            return false;
        }

        return true;
    };

    // Save a new track
    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            // Create a clean object with values properly formatted
            const trackToCreate = {
                station1ID: formData.station1ID,
                station2ID: formData.station2ID,
                distance: Number(formData.distance)
            };

            console.log("Creating track with data:", trackToCreate);

            await trackService.createTrack(trackToCreate);
            await fetchTracks();
            setIsAdding(false);
            setFormData({
                station1ID: '',
                station2ID: '',
                distance: ''
            });
            setError(null);
        }
        catch (err) {
            setError('Failed to create track: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Update an existing track
    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            // Create a clean object with values properly formatted
            const trackToUpdate = {
                station1ID: formData.station1ID,
                station2ID: formData.station2ID,
                distance: Number(formData.distance)
            };

            console.log("Updating track ID:", editingId, "with data:", trackToUpdate);

            await trackService.updateTrack(editingId, trackToUpdate);
            await fetchTracks();
            setEditingId(null);
            setFormData({
                station1ID: '',
                station2ID: '',
                distance: ''
            });
            setError(null);
        }
        catch (err) {
            setError('Failed to update track: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Delete a track
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this track?')) {
            try {
                await trackService.deleteTrack(id);
                await fetchTracks();
                setError(null);
            } catch (err) {
                setError('Failed to delete track: ' + (err.toString() || 'Unknown error'));
                console.error(err);
            }
        }
    };

    // Get station name by ID for display
    const getStationName = (stationID) => {
        const station = stations.find(s => s.stationID === stationID);
        return station ? station.stationName : 'Unknown Station';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Track Management</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    disabled={isAdding}
                >
                    <FaPlus className="mr-2" /> Add New Track
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {/* Scrollable table container with fixed height */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station 1</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station 2</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Distance (km)</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add new track row - sticky below header */}
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="station1ID"
                                        value={formData.station1ID}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Station 1</option>
                                        {stations.map(station => (
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
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Station 2</option>
                                        {stations.map(station => (
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
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                        >
                                            <FaSave className="mr-1" /> Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
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
                        {tracks.length > 0 ? (
                            tracks.map((track) => (
                                <tr key={track.trackID} className={editingId === track.trackID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === track.trackID ? (
                                            <select
                                                name="station1ID"
                                                value={formData.station1ID}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                {stations.map(station => (
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
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                {stations.map(station => (
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
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                    >
                                                        <FaSave className="mr-1" /> Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                    >
                                                        <FaTimes className="mr-1" /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(track)}
                                                        disabled={isAdding || editingId !== null}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(track.trackID)}
                                                        disabled={isAdding || editingId !== null}
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
                                <td colSpan="4" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
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