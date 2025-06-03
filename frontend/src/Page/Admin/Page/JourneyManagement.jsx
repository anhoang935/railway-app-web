import React, { useState } from 'react';
import journeyService from '../../../data/Service/journeyService';
import stationService from '../../../data/Service/stationService';
import scheduleService from '../../../data/Service/scheduleService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './JourneyManagement.css';

const JourneyManagement = ({ setActiveTab }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isJourneyIDManual, setIsJourneyIDManual] = useState(false);
    const [formData, setFormData] = useState({
        journeyID: '',
        scheduleID: '',
        stationID: '',
        arrivalTime: '',
        departureTime: ''
    });

    // Use useAsyncData for initial data fetching
    const {
        data: journeys,
        loading: dataLoading,
        error: dataError,
        refetch: refetchJourneys,
        setData: setJourneys
    } = useAsyncData(() => journeyService.getAllJourneys());

    const {
        data: stations,
        loading: stationsLoading,
        error: stationsError,
        refetch: refetchStations
    } = useAsyncData(() => stationService.getAllStations());

    const {
        data: schedules,
        loading: schedulesLoading,
        error: schedulesError,
        refetch: refetchSchedules
    } = useAsyncData(() => scheduleService.getAllSchedules());

    // Use useLoadingWithTimeout for operations (create, update, delete)
    const {
        loading: operationLoading,
        error: operationError,
        setError: setOperationError,
        startLoading,
        stopLoading,
        setLoadingError
    } = useLoadingWithTimeout();

    // Show blank loading page while initial data loads
    const isInitialLoading = dataLoading || stationsLoading || schedulesLoading;
    const currentError = dataError || stationsError || schedulesError || operationError;

    // Show loading page during initial data fetch with specific messages
    if (isInitialLoading) {
        let loadingMessage = "Loading journey management...";
        if (dataLoading) loadingMessage = "Loading journeys...";
        else if (stationsLoading) loadingMessage = "Loading stations...";
        else if (schedulesLoading) loadingMessage = "Loading schedules...";

        return <LoadingPage message={loadingMessage} />;
    }

    // Generate journey ID based on selected schedule
    const generateJourneyID = (selectedScheduleID) => {
        if (!selectedScheduleID) return '';

        // Find all existing journeys for this schedule
        const journeysForSchedule = journeys.filter(j =>
            j.scheduleID.toString() === selectedScheduleID.toString()
        );

        // Get the highest auto-increment number for this schedule
        const maxAutoIncrement = journeysForSchedule.length > 0
            ? Math.max(...journeysForSchedule.map(j => {
                const journeyIdStr = j.journeyID.toString();
                if (journeyIdStr.length >= 4) {
                    // Extract last 2 digits as auto-increment
                    return parseInt(journeyIdStr.slice(-2)) || 0;
                }
                return 0;
            }))
            : 0;

        // Format: ab (schedule ID padded to 2 digits) + cd (auto-increment padded to 2 digits)
        const schedulePart = selectedScheduleID.toString().padStart(2, '0');
        const autoIncrementPart = (maxAutoIncrement + 1).toString().padStart(2, '0');

        return schedulePart + autoIncrementPart;
    };

    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
        setIsJourneyIDManual(false);
        setFormData({
            journeyID: '',
            scheduleID: '',
            stationID: '',
            arrivalTime: '',
            departureTime: ''
        });
        // Clear any previous operation errors when starting new action
        setOperationError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };

        // Auto-generate journey ID when schedule is selected during adding (only if not in manual mode)
        if (name === 'scheduleID' && isAdding && !isJourneyIDManual) {
            newFormData.journeyID = generateJourneyID(value);
        }

        setFormData(newFormData);
    };

    // Toggle manual journey ID editing
    const toggleJourneyIDEdit = () => {
        setIsJourneyIDManual(!isJourneyIDManual);
        if (!isJourneyIDManual && formData.scheduleID) {
            // If switching from manual to auto, regenerate the ID
            setFormData(prev => ({
                ...prev,
                journeyID: generateJourneyID(prev.scheduleID)
            }));
        }
    };

    const handleEdit = (journey) => {
        setIsAdding(false);
        setEditingId(journey.journeyID);
        setFormData({
            journeyID: journey.journeyID,
            scheduleID: journey.scheduleID,
            stationID: journey.stationID,
            arrivalTime: journey.arrivalTime || '',
            departureTime: journey.departureTime || ''
        });
        // Clear any previous operation errors when starting edit
        setOperationError(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            journeyID: '',
            scheduleID: '',
            stationID: '',
            arrivalTime: '',
            departureTime: ''
        });
        // Clear operation errors when canceling
        setOperationError(null);
    };

    const validateForm = () => {
        if (!formData.journeyID || formData.journeyID.toString().trim() === '') {
            setOperationError('Journey ID is required.');
            return false;
        }
        if (!formData.scheduleID || formData.scheduleID.toString().trim() === '') {
            setOperationError('Schedule ID is required.');
            return false;
        }
        if (!formData.stationID || formData.stationID.toString().trim() === '') {
            setOperationError('Station ID is required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading(); // Use operation loading for this action

            const journeyToCreate = {
                journeyID: formData.journeyID,
                scheduleID: formData.scheduleID,
                stationID: formData.stationID,
                arrivalTime: formData.arrivalTime,
                departureTime: formData.departureTime
            };

            console.log("Creating journey with data:", journeyToCreate);

            // Create the journey
            const newJourney = await journeyService.createJourney(journeyToCreate);

            // Optimistic update: add to local state immediately
            if (newJourney) {
                setJourneys(prevJourneys => [...prevJourneys, newJourney]);
            } else {
                // Fallback: refetch all data if creation response doesn't include the new journey
                await refetchJourneys();
            }

            // Reset form and states
            setIsAdding(false);
            setFormData({
                journeyID: '',
                scheduleID: '',
                stationID: '',
                arrivalTime: '',
                departureTime: ''
            });

            stopLoading(); // Stop operation loading on success
        }
        catch (error) {
            setLoadingError('Failed to create journey: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const journeyToUpdate = {
                journeyID: formData.journeyID,
                scheduleID: formData.scheduleID,
                stationID: formData.stationID,
                arrivalTime: formData.arrivalTime,
                departureTime: formData.departureTime
            };

            console.log("Updating journey ID:", editingId, "with data:", journeyToUpdate);

            // Update the journey
            await journeyService.updateJourney(editingId, journeyToUpdate);

            // Optimistic update: update local state immediately
            setJourneys(prevJourneys =>
                prevJourneys.map(journey =>
                    journey.journeyID === editingId
                        ? { ...journey, ...journeyToUpdate }
                        : journey
                )
            );

            // Reset form and states
            setEditingId(null);
            setFormData({
                journeyID: '',
                scheduleID: '',
                stationID: '',
                arrivalTime: '',
                departureTime: ''
            });

            stopLoading();
        }
        catch (error) {
            setLoadingError('Failed to update journey: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this journey?')) {
            try {
                startLoading();

                await journeyService.deleteJourney(id);

                // Optimistic update: remove from local state immediately
                setJourneys(prevJourneys => prevJourneys.filter(journey => journey.journeyID !== id));

                stopLoading();
            } catch (error) {
                setLoadingError('Failed to delete journey: ' + (error.toString() || 'Unknown error'));
                console.error(error);
                // If delete failed, refetch to ensure data consistency
                await refetchJourneys();
            }
        }
    };

    // Helper functions
    const getStationNameById = (id) => {
        const station = stations.find(s => s.stationID.toString() === id.toString());
        return station ? station.stationName : 'Unknown Station';
    };

    const getScheduleDisplayText = (scheduleID) => {
        const schedule = schedules.find(s => s.scheduleID.toString() === scheduleID.toString());
        if (schedule) {
            return `${schedule.start_stationName} → ${schedule.end_stationName} (${schedule.trainName})`;
        }
        return 'Unknown Schedule';
    };

    return (
        <div className="p-4 h-screen flex flex-col journey-management relative">
            {/* Only show operation loading overlay, not initial loading */}
            {operationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing...</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Journey Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            refetchJourneys();
                            refetchStations();
                            refetchSchedules();
                        }}
                        disabled={isAdding || editingId || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh all data"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || editingId || operationLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="mr-2" />
                        Add New Journey
                    </button>
                </div>
            </div>

            {/* Error message */}
            {currentError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {dataError ? 'Journey Data Error' :
                                    stationsError ? 'Station Data Error' :
                                        schedulesError ? 'Schedule Data Error' : 'Operation Error'}
                            </p>
                            <p className="mt-1">{currentError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setOperationError(null);
                                if (dataError) refetchJourneys();
                                if (stationsError) refetchStations();
                                if (schedulesError) refetchSchedules();
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
                    <strong>Journeys:</strong> {journeys.length} |
                    <strong> Stations:</strong> {stations.length} |
                    <strong> Schedules:</strong> {schedules.length} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Table container */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Journey ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train Schedule</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Arrival Time</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Departure Time</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add new journey row - sticky below header */}
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center">
                                        <div className="flex items-center space-x-2 w-full">
                                            <input
                                                type="text"
                                                name="journeyID"
                                                value={formData.journeyID}
                                                onChange={handleInputChange}
                                                readOnly={!isJourneyIDManual}
                                                disabled={operationLoading}
                                                className={`flex-1 px-2 py-1 border rounded focus:outline-none h-8 ${isJourneyIDManual
                                                    ? 'focus:border-blue-500 bg-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                placeholder={isJourneyIDManual ? "Enter Journey ID" : "Select schedule first"}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleJourneyIDEdit}
                                                disabled={operationLoading}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded flex items-center justify-center text-xs h-8 w-12 flex-shrink-0 disabled:opacity-50"
                                                title={isJourneyIDManual ? "Switch to auto-generate" : "Edit manually"}
                                            >
                                                {isJourneyIDManual ? "Auto" : "Edit"}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center">
                                        <select
                                            name="scheduleID"
                                            value={formData.scheduleID}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        >
                                            <option value="">Select Schedule</option>
                                            {schedules.map(schedule => (
                                                <option key={schedule.scheduleID} value={schedule.scheduleID}>
                                                    {schedule.start_stationName} → {schedule.end_stationName} ({schedule.trainName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center">
                                        <select
                                            name="stationID"
                                            value={formData.stationID}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        >
                                            <option value="">Select Station</option>
                                            {stations.map(station => (
                                                <option key={station.stationID} value={station.stationID}>
                                                    {station.stationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center">
                                        <input
                                            type="time"
                                            name="arrivalTime"
                                            value={formData.arrivalTime}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center">
                                        <input
                                            type="time"
                                            name="departureTime"
                                            value={formData.departureTime}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex justify-center items-center space-x-2">
                                        <button
                                            onClick={handleSaveNew}
                                            disabled={operationLoading}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center h-8 disabled:opacity-50"
                                        >
                                            <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={operationLoading}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center h-8 disabled:opacity-50"
                                        >
                                            <FaTimes className="mr-1" /> Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {journeys.length > 0 ? (
                            journeys.map((journey) => (
                                <tr key={journey.journeyID} className={editingId === journey.journeyID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                        {journey.journeyID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <select
                                                name="scheduleID"
                                                value={formData.scheduleID}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Schedule</option>
                                                {schedules.map(schedule => (
                                                    <option key={schedule.scheduleID} value={schedule.scheduleID}>
                                                        {schedule.start_stationName} → {schedule.end_stationName} ({schedule.trainName})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getScheduleDisplayText(journey.scheduleID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <select
                                                name="stationID"
                                                value={formData.stationID}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Station</option>
                                                {stations.map(station => (
                                                    <option key={station.stationID} value={station.stationID}>
                                                        {station.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getStationNameById(journey.stationID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <div className="h-12 flex items-center">
                                                <input
                                                    type="time"
                                                    name="arrivalTime"
                                                    value={formData.arrivalTime}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                                />
                                            </div>
                                        ) : (
                                            journey.arrivalTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <div className="h-12 flex items-center">
                                                <input
                                                    type="time"
                                                    name="departureTime"
                                                    value={formData.departureTime}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                                />
                                            </div>
                                        ) : (
                                            journey.departureTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === journey.journeyID ? (
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
                                                        onClick={() => handleEdit(journey)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(journey.journeyID)}
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
                                <td colSpan="6" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No journeys found. Add a new journey to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JourneyManagement;