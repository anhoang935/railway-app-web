import React, { useState, useEffect } from 'react';
import scheduleService from '../../../data/Service/scheduleService';
import stationService from '../../../data/Service/stationService';
import trainService from '../../../data/Service/trainService'; // Assuming this exists
import LoadingSpinner from '../Components/LoadingSpinner';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaClock, FaTrain } from 'react-icons/fa';
import './Scheduling.css';

const Scheduling = ({ setActiveTab }) => {
    const [schedules, setSchedules] = useState([]);
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        scheduleID: '',
        trainID: '',
        start_stationID: '',
        end_stationID: '',
        departureTime: '',
        arrivalTime: '',
        scheduleStatus: 'Active'
    });

    useEffect(() => {
        fetchSchedules();
        fetchStations();
        fetchTrains();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const data = await scheduleService.getAllSchedules();
            setSchedules(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setError('Failed to load schedule data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        try {
            const data = await stationService.getAllStations();
            setStations(data);
        } catch (error) {
            console.error('Error fetching stations:', error);
            setError('Failed to load station data. Please try again.');
        }
    };

    const fetchTrains = async () => {
        try {
            const data = await trainService.getAllTrains();
            setTrains(data);
        } catch (error) {
            console.error('Error fetching trains:', error);
            setError('Failed to load train data. Please try again.');

            // Fallback to mock data if service fails
            setTrains([
                { trainID: 'SE1', trainName: 'SE1 Express' },
                { trainID: 'SE2', trainName: 'SE2 Express' },
                { trainID: 'SE3', trainName: 'SE3 Express' }
            ]);
        }
    };

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
                setError('Start and end stations cannot be the same.');
            } else if (error && error.includes('cannot be the same')) {
                setError(null);
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
            scheduleStatus: 'Active'
        });
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
            scheduleStatus: schedule.scheduleStatus || 'Active'
        });
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
            scheduleStatus: 'Active'
        });
    };

    const validateForm = () => {
        // Clear previous error
        setError(null);

        if (!formData.trainID) {
            setError('Train is required.');
            return false;
        }
        if (!formData.start_stationID) {
            setError('Start station is required.');
            return false;
        }
        if (!formData.end_stationID) {
            setError('End station is required.');
            return false;
        }

        // Enhanced same station validation
        const startStationStr = formData.start_stationID.toString();
        const endStationStr = formData.end_stationID.toString();

        if (startStationStr === endStationStr) {
            setError('Start and end stations cannot be the same. Please select different stations.');
            return false;
        }

        if (!formData.departureTime || !formData.arrivalTime) {
            setError('Both departure and arrival times are required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            const scheduleToCreate = {
                start_stationID: formData.start_stationID,
                end_stationID: formData.end_stationID,
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                scheduleStatus: formData.scheduleStatus,
                trainID: formData.trainID
            };

            await scheduleService.createSchedule(scheduleToCreate);
            await fetchSchedules();
            setIsAdding(false);
            setFormData({
                scheduleID: '',
                trainID: '',
                start_stationID: '',
                end_stationID: '',
                departureTime: '',
                arrivalTime: '',
                scheduleStatus: 'Active'
            });
            setError(null);
        } catch (error) {
            setError('Failed to create schedule: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            const scheduleToUpdate = {
                start_stationID: formData.start_stationID,
                end_stationID: formData.end_stationID,
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                scheduleStatus: formData.scheduleStatus,
                trainID: formData.trainID
            };

            await scheduleService.updateSchedule(editingId, scheduleToUpdate);
            await fetchSchedules();
            setEditingId(null);
            setFormData({
                scheduleID: '',
                trainID: '',
                start_stationID: '',
                end_stationID: '',
                departureTime: '',
                arrivalTime: '',
                scheduleStatus: 'Active'
            });
            setError(null);
        } catch (error) {
            setError('Failed to update schedule: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await scheduleService.deleteSchedule(id);
                await fetchSchedules();
                setError(null);
            } catch (error) {
                setError('Failed to delete schedule: ' + (error.toString() || 'Unknown error'));
                console.error(error);
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

    if (loading) {
        return <div className="p-4 text-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Train Scheduling
                    </h1>
                </div>
                <button
                    onClick={handleAddNew}
                    disabled={isAdding || editingId !== null}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPlus className="mr-2" /> Add New Schedule
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

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
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="time"
                                        name="arrivalTime"
                                        value={formData.arrivalTime}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="scheduleStatus"
                                        value={formData.scheduleStatus}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
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
                        {schedules.length > 0 ? (
                            schedules.map((schedule) => (
                                <tr key={schedule.scheduleID} className={editingId === schedule.scheduleID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-medium">
                                        {schedule.scheduleID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === schedule.scheduleID ? (
                                            <select
                                                name="trainID"
                                                value={formData.trainID}
                                                onChange={handleInputChange}
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
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                        ) : (
                                            getStatusBadge(schedule.scheduleStatus || 'Active')
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === schedule.scheduleID ? (
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
                                                        onClick={() => handleEdit(schedule)}
                                                        disabled={isAdding || editingId !== null}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.scheduleID)}
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
                                <td colSpan="7" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <FaClock className="text-4xl text-gray-300 mb-2" />
                                        <p>No schedules found. Add a new schedule to get started.</p>
                                    </div>
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