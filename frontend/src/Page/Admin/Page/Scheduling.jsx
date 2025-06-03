import React, { useState } from 'react';
import scheduleService from '../../../data/Service/scheduleService';
import stationService from '../../../data/Service/stationService';
import trainService from '../../../data/Service/trainService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaClock, FaTrain } from 'react-icons/fa';

const Scheduling = ({ setActiveTab }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        scheduleID: '',
        trainID: '',
        start_stationID: '',
        end_stationID: '',
        departureTime: '',
        arrivalTime: '',
        scheduleStatus: 'on-time'
    });

    // Use useAsyncData for initial data fetching
    const {
        data: schedules,
        loading: schedulesLoading,
        error: schedulesError,
        refetch: refetchSchedules,
        setData: setSchedules
    } = useAsyncData(() => scheduleService.getAllSchedules());

    const {
        data: stations,
        loading: stationsLoading,
        error: stationsError,
        refetch: refetchStations
    } = useAsyncData(() => stationService.getAllStations());

    const {
        data: trains,
        loading: trainsLoading,
        error: trainsError,
        refetch: refetchTrains
    } = useAsyncData(() => trainService.getAllTrains());

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
    const isInitialLoading = schedulesLoading || stationsLoading || trainsLoading;

    if (isInitialLoading) {
        let loadingMessage = "Loading scheduling data...";
        if (schedulesLoading) loadingMessage = "Loading schedules...";
        else if (stationsLoading) loadingMessage = "Loading stations...";
        else if (trainsLoading) loadingMessage = "Loading trains...";

        return <LoadingPage message={loadingMessage} />;
    }

    // Combine error states
    const currentError = schedulesError || stationsError || trainsError || operationError;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };

        // Enhanced validation for same station issue
        if (name === 'start_stationID' || name === 'end_stationID') {
            // Convert both values to strings for consistent comparison
            const startStation = newFormData.start_stationID ? newFormData.start_stationID.toString() : '';
            const endStation = newFormData.end_stationID ? newFormData.end_stationID.toString() : '';

            if (startStation && endStation && startStation === endStation) {
                setOperationError('Start and end stations cannot be the same.');
            } else if (operationError && operationError.includes('cannot be the same')) {
                setOperationError(null);
            }
        }

        setFormData(newFormData);
    };

    const handleAddNew = () => {
        // Generate a new ID based on existing schedules
        const maxId = schedules.length > 0
            ? Math.max(...schedules.map(s => {
                const numericPart = s.scheduleID.toString().replace(/\D/g, '');
                return numericPart ? parseInt(numericPart) : 0;
            }))
            : 0;

        setIsAdding(true);
        setEditingId(null);
        setFormData({
            scheduleID: `SC${maxId + 1}`,
            trainID: '',
            start_stationID: '',
            end_stationID: '',
            departureTime: '',
            arrivalTime: '',
            scheduleStatus: 'on-time'
        });
        setOperationError(null);
    };

    const handleEdit = (schedule) => {
        setIsAdding(false);
        setEditingId(schedule.scheduleID);
        setFormData({
            scheduleID: schedule.scheduleID,
            trainID: schedule.trainID,
            start_stationID: schedule.start_stationID,
            end_stationID: schedule.end_stationID,
            departureTime: schedule.departureTime || '',
            arrivalTime: schedule.arrivalTime || '',
            scheduleStatus: schedule.scheduleStatus || 'on-time'
        });
        setOperationError(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            scheduleID: '',
            trainID: '',
            start_stationID: '',
            end_stationID: '',
            departureTime: '',
            arrivalTime: '',
            scheduleStatus: 'on-time'
        });
        setOperationError(null);
    };

    const validateForm = () => {
        if (!formData.trainID) {
            setOperationError('Train is required.');
            return false;
        }
        if (!formData.start_stationID) {
            setOperationError('Start station is required.');
            return false;
        }
        if (!formData.end_stationID) {
            setOperationError('End station is required.');
            return false;
        }

        // Enhanced same station validation
        const startStationStr = formData.start_stationID.toString();
        const endStationStr = formData.end_stationID.toString();

        if (startStationStr === endStationStr) {
            setOperationError('Start and end stations cannot be the same. Please select different stations.');
            return false;
        }

        if (!formData.departureTime || !formData.arrivalTime) {
            setOperationError('Both departure and arrival times are required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const scheduleToCreate = {
                start_stationID: formData.start_stationID,
                end_stationID: formData.end_stationID,
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                scheduleStatus: formData.scheduleStatus,
                trainID: formData.trainID
            };

            const newSchedule = await scheduleService.createSchedule(scheduleToCreate);

            // Optimistic update
            if (newSchedule) {
                setSchedules(prevSchedules => [...prevSchedules, newSchedule]);
            } else {
                await refetchSchedules();
            }

            setIsAdding(false);
            setFormData({
                scheduleID: '',
                trainID: '',
                start_stationID: '',
                end_stationID: '',
                departureTime: '',
                arrivalTime: '',
                scheduleStatus: 'on-time'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to create schedule: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const scheduleToUpdate = {
                start_stationID: formData.start_stationID,
                end_stationID: formData.end_stationID,
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                scheduleStatus: formData.scheduleStatus,
                trainID: formData.trainID
            };

            await scheduleService.updateSchedule(editingId, scheduleToUpdate);

            // Optimistic update
            setSchedules(prevSchedules =>
                prevSchedules.map(schedule =>
                    schedule.scheduleID === editingId
                        ? { ...schedule, ...scheduleToUpdate }
                        : schedule
                )
            );

            setEditingId(null);
            setFormData({
                scheduleID: '',
                trainID: '',
                start_stationID: '',
                end_stationID: '',
                departureTime: '',
                arrivalTime: '',
                scheduleStatus: 'on-time'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to update schedule: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                startLoading();

                await scheduleService.deleteSchedule(id);

                // Optimistic update
                setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.scheduleID !== id));

                stopLoading();
            } catch (error) {
                setLoadingError('Failed to delete schedule: ' + (error.toString() || 'Unknown error'));
                console.error(error);
                // If delete failed, refetch to ensure data consistency
                await refetchSchedules();
            }
        }
    };

    // Helper functions
    const getStationNameById = (id) => {
        const station = stations.find(s => s.stationID.toString() === id.toString());
        return station ? station.stationName : 'Unknown Station';
    };

    const getTrainNameById = (id) => {
        const train = trains.find(t => t.trainID.toString() === id.toString());
        return train ? train.trainName : 'Unknown Train';
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Active': 'bg-green-100 text-green-800',
            'active': 'bg-green-100 text-green-800',
            'on-time': 'bg-green-100 text-green-800',
            'Inactive': 'bg-red-100 text-red-800',
            'cancelled': 'bg-red-100 text-red-800',
            'Maintenance': 'bg-yellow-100 text-yellow-800',
            'delayed': 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-4 h-screen flex flex-col scheduling-management relative">
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
                <h1 className="text-2xl font-bold">Scheduling Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            refetchSchedules();
                            refetchStations();
                            refetchTrains();
                        }}
                        disabled={isAdding || editingId || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh all data"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || operationLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="mr-2" />
                        Add New Schedule
                    </button>
                </div>
            </div>

            {/* Error message */}
            {currentError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {schedulesError ? 'Schedule Data Error' :
                                    stationsError ? 'Station Data Error' :
                                        trainsError ? 'Train Data Error' : 'Operation Error'}
                            </p>
                            <p className="mt-1">{currentError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setOperationError(null);
                                if (schedulesError) refetchSchedules();
                                if (stationsError) refetchStations();
                                if (trainsError) refetchTrains();
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
                    <strong>Schedules:</strong> {schedules.length} |
                    <strong> Stations:</strong> {stations.length} |
                    <strong> Trains:</strong> {trains.length} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Table container */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Schedule ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Route</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Departure</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Arrival</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Status</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add new schedule row - sticky below header */}
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <span className="text-gray-500 italic">Auto-generated</span>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="trainID"
                                        value={formData.trainID}
                                        onChange={handleInputChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Train</option>
                                        {trains.map(train => (
                                            <option key={train.trainID} value={train.trainID}>
                                                {train.trainName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex space-x-2">
                                        <select
                                            name="start_stationID"
                                            value={formData.start_stationID}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className={`w-1/2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500 ${formData.start_stationID === formData.end_stationID && formData.start_stationID
                                                ? 'border-red-500 bg-red-50'
                                                : ''
                                                }`}
                                        >
                                            <option value="">From</option>
                                            {stations.map(station => (
                                                <option key={station.stationID} value={station.stationID}>
                                                    {station.stationName}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="flex items-center">→</span>
                                        <select
                                            name="end_stationID"
                                            value={formData.end_stationID}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className={`w-1/2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500 ${formData.start_stationID === formData.end_stationID && formData.end_stationID
                                                ? 'border-red-500 bg-red-50'
                                                : ''
                                                }`}
                                        >
                                            <option value="">To</option>
                                            {stations.map(station => (
                                                <option
                                                    key={station.stationID}
                                                    value={station.stationID}
                                                    disabled={station.stationID.toString() === formData.start_stationID.toString()}
                                                >
                                                    {station.stationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="time"
                                        name="departureTime"
                                        value={formData.departureTime}
                                        onChange={handleInputChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="time"
                                        name="arrivalTime"
                                        value={formData.arrivalTime}
                                        onChange={handleInputChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="scheduleStatus"
                                        value={formData.scheduleStatus}
                                        onChange={handleInputChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="on-time">On Time</option>
                                        <option value="delayed">Delayed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
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
                        {schedules.length > 0 ? (
                            schedules.map((schedule) => (
                                <tr key={schedule.scheduleID} className={editingId === schedule.scheduleID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                        {schedule.scheduleID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <select
                                                name="trainID"
                                                value={formData.trainID}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Train</option>
                                                {trains.map(train => (
                                                    <option key={train.trainID} value={train.trainID}>
                                                        {train.trainName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center">
                                                <FaTrain className="mr-2 text-blue-500" />
                                                {getTrainNameById(schedule.trainID)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <div className="flex space-x-2">
                                                <select
                                                    name="start_stationID"
                                                    value={formData.start_stationID}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className={`w-1/2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500 ${formData.start_stationID === formData.end_stationID && formData.start_stationID
                                                        ? 'border-red-500 bg-red-50'
                                                        : ''
                                                        }`}
                                                >
                                                    <option value="">From</option>
                                                    {stations.map(station => (
                                                        <option key={station.stationID} value={station.stationID}>
                                                            {station.stationName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="flex items-center">→</span>
                                                <select
                                                    name="end_stationID"
                                                    value={formData.end_stationID}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className={`w-1/2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500 ${formData.start_stationID === formData.end_stationID && formData.end_stationID
                                                        ? 'border-red-500 bg-red-50'
                                                        : ''
                                                        }`}
                                                >
                                                    <option value="">To</option>
                                                    {stations.map(station => (
                                                        <option
                                                            key={station.stationID}
                                                            value={station.stationID}
                                                            disabled={station.stationID.toString() === formData.start_stationID.toString()}
                                                        >
                                                            {station.stationName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="font-medium">
                                                {getStationNameById(schedule.start_stationID)} → {getStationNameById(schedule.end_stationID)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <input
                                                type="time"
                                                name="departureTime"
                                                value={formData.departureTime}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            schedule.departureTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <input
                                                type="time"
                                                name="arrivalTime"
                                                value={formData.arrivalTime}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            schedule.arrivalTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <select
                                                name="scheduleStatus"
                                                value={formData.scheduleStatus}
                                                onChange={handleInputChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="on-time">On Time</option>
                                                <option value="delayed">Delayed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            getStatusBadge(schedule.scheduleStatus || 'on-time')
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === schedule.scheduleID ? (
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
                                                        onClick={() => handleEdit(schedule)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.scheduleID)}
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
                                <td colSpan="7" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No schedules found. Add a new schedule to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Scheduling;